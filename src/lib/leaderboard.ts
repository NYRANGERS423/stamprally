import "server-only";
import { db } from "@/lib/db";
import { boardValue, type Board, type RankRow } from "./leaderboard-shared";

// Re-export the isomorphic shapes so server-side callers can keep
// importing everything from @/lib/leaderboard.
export { boardValue };
export type { Board, RankRow };

export interface RangeOption {
  key: string;
  label: string;
  start?: Date; // inclusive
  end?: Date; // exclusive
}

// All three boards rank by POINTS (per fix-list 2026-05-16):
// - points    : total = stampPoints + accoladePoints
// - stamps    : stampPoints only (sum of activity.points)
// - accolades : accoladePoints only (sum of accolade.points)
// Counts are still surfaced in the secondary stat strip so users can
// see how their points break down.
export const BOARDS: Array<{ key: Board; label: string; hint: string }> = [
  {
    key: "points",
    label: "Overall",
    hint: "Combined stamp points + accolade points.",
  },
  {
    key: "stamps",
    label: "Stamp pts",
    hint: "Just the points from stamps you've collected.",
  },
  {
    key: "accolades",
    label: "Accolade pts",
    hint: "Just the points from accolades you've been awarded.",
  },
];

export function parseBoard(input: string | undefined): Board {
  if (input === "stamps" || input === "accolades") return input;
  return "points";
}

export function getRangeOptions(now: Date = new Date()): RangeOption[] {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const currentQuarter = Math.floor(month / 3) + 1;
  const out: RangeOption[] = [
    { key: "all", label: "All time" },
    {
      key: `year-${year}`,
      label: `This year (${year})`,
      start: new Date(Date.UTC(year, 0, 1)),
      end: new Date(Date.UTC(year + 1, 0, 1)),
    },
  ];
  for (let q = currentQuarter; q >= 1; q--) {
    out.push({
      key: `q${q}-${year}`,
      label: `Q${q} ${year}`,
      start: new Date(Date.UTC(year, (q - 1) * 3, 1)),
      end: new Date(Date.UTC(year, q * 3, 1)),
    });
  }
  const lastYear = year - 1;
  out.push({
    key: `year-${lastYear}`,
    label: `Year ${lastYear}`,
    start: new Date(Date.UTC(lastYear, 0, 1)),
    end: new Date(Date.UTC(year, 0, 1)),
  });
  for (let q = 4; q >= 1; q--) {
    out.push({
      key: `q${q}-${lastYear}`,
      label: `Q${q} ${lastYear}`,
      start: new Date(Date.UTC(lastYear, (q - 1) * 3, 1)),
      end: new Date(Date.UTC(lastYear, q * 3, 1)),
    });
  }
  return out;
}

export function findRange(
  key: string | undefined,
  opts: RangeOption[],
): RangeOption {
  return opts.find((o) => o.key === key) ?? opts[0];
}

export async function fetchLeaderboard({
  rangeStart,
  rangeEnd,
  eventId,
  board,
  limit = 100,
}: {
  rangeStart?: Date;
  rangeEnd?: Date;
  eventId?: string;
  board: Board;
  limit?: number;
}): Promise<RankRow[]> {
  const dateBox =
    rangeStart || rangeEnd
      ? {
          ...(rangeStart ? { gte: rangeStart } : {}),
          ...(rangeEnd ? { lt: rangeEnd } : {}),
        }
      : undefined;

  const stampWhere = {
    ...(dateBox ? { stampedAt: dateBox } : {}),
    ...(eventId ? { activity: { eventId } } : {}),
  };
  const accoladeWhere = {
    ...(dateBox ? { awardedAt: dateBox } : {}),
    ...(eventId ? { eventId } : {}),
  };

  // Fetch every user so 0-pts folks still appear in the ranks (so they
  // can see themselves "at the bottom") — per the 2026-05-16 fix list.
  // For deployments larger than the limit, the slice still trims at
  // the bottom; the YouFooter handles surfacing the session user when
  // they fall outside.
  const [stampDetails, accoladeGroups, allUsers] = await Promise.all([
    db.stamp.findMany({
      where: stampWhere,
      select: {
        userId: true,
        activity: { select: { eventId: true, points: true } },
      },
    }),
    db.accolade.groupBy({
      by: ["userId"],
      where: accoladeWhere,
      _count: { _all: true },
      _sum: { points: true },
    }),
    db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoPath: true,
      },
    }),
  ]);

  interface StampAgg {
    stamps: number;
    points: number;
    eventsSet: Set<string>;
  }
  const perUser = new Map<string, StampAgg>();
  for (const s of stampDetails) {
    let agg = perUser.get(s.userId);
    if (!agg) {
      agg = { stamps: 0, points: 0, eventsSet: new Set() };
      perUser.set(s.userId, agg);
    }
    agg.stamps += 1;
    agg.points += s.activity.points;
    agg.eventsSet.add(s.activity.eventId);
  }

  const accoladeCount = new Map(
    accoladeGroups.map((g) => [g.userId, g._count._all]),
  );
  const accoladePointsMap = new Map(
    accoladeGroups.map((g) => [g.userId, g._sum.points ?? 0]),
  );

  const rows: RankRow[] = allUsers.map((u) => {
    const sa = perUser.get(u.id);
    const stampPoints = sa?.points ?? 0;
    const accoladePoints = accoladePointsMap.get(u.id) ?? 0;
    return {
      userId: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      photoPath: u.photoPath,
      stamps: sa?.stamps ?? 0,
      accolades: accoladeCount.get(u.id) ?? 0,
      events: sa?.eventsSet.size ?? 0,
      stampPoints,
      accoladePoints,
      points: stampPoints + accoladePoints,
    };
  });

  // Sort by chosen board's points metric, with consistent tiebreakers.
  rows.sort((a, b) => {
    const primary = boardValue(b, board) - boardValue(a, board);
    if (primary !== 0) return primary;
    // Tiebreak: overall points → stamps count → accolades count → name.
    return (
      b.points - a.points ||
      b.stamps - a.stamps ||
      b.accolades - a.accolades ||
      a.lastName.localeCompare(b.lastName)
    );
  });

  return rows.slice(0, limit);
}

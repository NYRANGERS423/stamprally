import "server-only";
import { db } from "@/lib/db";

export interface RangeOption {
  key: string;
  label: string;
  start?: Date; // inclusive
  end?: Date; // exclusive
}

export type Board = "points" | "stamps" | "accolades";

export const BOARDS: Array<{ key: Board; label: string; hint: string }> = [
  { key: "points", label: "Points", hint: "Stamp + accolade points combined" },
  { key: "stamps", label: "Stamps", hint: "Most stamps collected" },
  { key: "accolades", label: "Accolades", hint: "Most accolades earned" },
];

export function parseBoard(input: string | undefined): Board {
  if (input === "stamps" || input === "accolades") return input;
  return "points";
}

export interface RankRow {
  userId: string;
  firstName: string;
  lastName: string;
  photoPath: string | null;
  stamps: number;
  accolades: number;
  events: number;
  points: number;
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

  const [stampDetails, accoladeGroups] = await Promise.all([
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
  ]);

  // Aggregate stamps per user (count + sum of activity.points + distinct events).
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
  const accoladePoints = new Map(
    accoladeGroups.map((g) => [g.userId, g._sum.points ?? 0]),
  );

  const userIds = new Set<string>([
    ...perUser.keys(),
    ...accoladeGroups.map((g) => g.userId),
  ]);
  if (userIds.size === 0) return [];

  const users = await db.user.findMany({
    where: { id: { in: Array.from(userIds) } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      photoPath: true,
    },
  });

  const rows: RankRow[] = users.map((u) => {
    const sa = perUser.get(u.id);
    return {
      userId: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      photoPath: u.photoPath,
      stamps: sa?.stamps ?? 0,
      accolades: accoladeCount.get(u.id) ?? 0,
      events: sa?.eventsSet.size ?? 0,
      points: (sa?.points ?? 0) + (accoladePoints.get(u.id) ?? 0),
    };
  });

  // Sort by chosen board, with stable tiebreakers across boards.
  rows.sort((a, b) => {
    if (board === "points") {
      return (
        b.points - a.points ||
        b.stamps - a.stamps ||
        b.accolades - a.accolades ||
        a.lastName.localeCompare(b.lastName)
      );
    }
    if (board === "stamps") {
      return (
        b.stamps - a.stamps ||
        b.points - a.points ||
        b.accolades - a.accolades ||
        a.lastName.localeCompare(b.lastName)
      );
    }
    // accolades
    return (
      b.accolades - a.accolades ||
      b.points - a.points ||
      b.stamps - a.stamps ||
      a.lastName.localeCompare(b.lastName)
    );
  });

  // Drop rows that score 0 on the active board so the page isn't padded
  // with everyone who's ever stamped but has no entries in this range.
  const filtered = rows.filter((r) => {
    if (board === "points") return r.points > 0;
    if (board === "stamps") return r.stamps > 0;
    return r.accolades > 0;
  });

  return filtered.slice(0, limit);
}

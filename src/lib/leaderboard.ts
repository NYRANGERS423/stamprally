import "server-only";
import { db } from "@/lib/db";

export interface RangeOption {
  key: string;
  label: string;
  start?: Date; // inclusive
  end?: Date; // exclusive
}

export interface RankRow {
  userId: string;
  firstName: string;
  lastName: string;
  photoPath: string | null;
  stamps: number;
  accolades: number;
  events: number;
}

// Build the list of date-range options for the leaderboard filter. Always
// "All time" + the current year + every quarter up to now, plus the prior
// year with all four quarters.
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
  limit = 100,
}: {
  rangeStart?: Date;
  rangeEnd?: Date;
  eventId?: string;
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

  const [stampGroups, accoladeGroups, eventStampDetails] = await Promise.all([
    db.stamp.groupBy({
      by: ["userId"],
      where: stampWhere,
      _count: { _all: true },
    }),
    db.accolade.groupBy({
      by: ["userId"],
      where: accoladeWhere,
      _count: { _all: true },
    }),
    db.stamp.findMany({
      where: stampWhere,
      select: { userId: true, activity: { select: { eventId: true } } },
    }),
  ]);

  // Distinct event count per user within the filter.
  const eventsByUser = new Map<string, Set<string>>();
  for (const s of eventStampDetails) {
    let set = eventsByUser.get(s.userId);
    if (!set) {
      set = new Set();
      eventsByUser.set(s.userId, set);
    }
    set.add(s.activity.eventId);
  }

  const userIds = new Set<string>([
    ...stampGroups.map((g) => g.userId),
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

  const stampCount = new Map(stampGroups.map((g) => [g.userId, g._count._all]));
  const accoladeCount = new Map(
    accoladeGroups.map((g) => [g.userId, g._count._all]),
  );

  return users
    .map((u) => ({
      userId: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      photoPath: u.photoPath,
      stamps: stampCount.get(u.id) ?? 0,
      accolades: accoladeCount.get(u.id) ?? 0,
      events: eventsByUser.get(u.id)?.size ?? 0,
    }))
    .sort(
      (a, b) =>
        b.stamps - a.stamps ||
        b.accolades - a.accolades ||
        b.events - a.events ||
        a.lastName.localeCompare(b.lastName),
    )
    .slice(0, limit);
}

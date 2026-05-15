import "server-only";
import { db } from "@/lib/db";

export interface PersonalStats {
  totalStamps: number;
  eventsParticipated: number;
  // Per-event completion data (active-activity coverage)
  eventCompletion: Array<{
    eventId: string;
    eventName: string;
    eventSlug: string;
    stamped: number;
    total: number;
  }>;
}

export interface Accolade {
  kind: string;
  label: string;
  description: string;
}

export interface UserAccolades {
  globetrotterEventNames: string[]; // events where user stamped every active activity
  earlyBirdActivityNames: string[]; // activities where user was the first stamper
  marathoner: boolean; // stamped at 3+ different events
  firstStamper: boolean; // has at least one stamp
}

const MARATHONER_THRESHOLD = 3;

export async function computePersonalStats(
  userId: string,
): Promise<PersonalStats> {
  const stamps = await db.stamp.findMany({
    where: { userId },
    select: {
      activityId: true,
      activity: {
        select: {
          destination: {
            select: {
              event: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
    },
  });

  const eventMap = new Map<
    string,
    { eventId: string; eventName: string; eventSlug: string; stamped: number }
  >();
  for (const s of stamps) {
    const ev = s.activity.destination.event;
    const cur = eventMap.get(ev.id);
    if (cur) cur.stamped += 1;
    else
      eventMap.set(ev.id, {
        eventId: ev.id,
        eventName: ev.name,
        eventSlug: ev.slug,
        stamped: 1,
      });
  }

  const eventIds = Array.from(eventMap.keys());
  let activeTotalByEvent = new Map<string, number>();
  if (eventIds.length > 0) {
    const rows = await db.activity.groupBy({
      by: ["destinationId"],
      where: {
        active: true,
        destination: { eventId: { in: eventIds } },
      },
      _count: { _all: true },
    });
    // Need eventId per destination — fetch lookup
    const destinations = await db.destination.findMany({
      where: { id: { in: rows.map((r) => r.destinationId) } },
      select: { id: true, eventId: true },
    });
    const destToEvent = new Map(destinations.map((d) => [d.id, d.eventId]));
    activeTotalByEvent = new Map<string, number>();
    for (const r of rows) {
      const eId = destToEvent.get(r.destinationId);
      if (!eId) continue;
      activeTotalByEvent.set(
        eId,
        (activeTotalByEvent.get(eId) ?? 0) + r._count._all,
      );
    }
  }

  const eventCompletion = Array.from(eventMap.values()).map((e) => ({
    eventId: e.eventId,
    eventName: e.eventName,
    eventSlug: e.eventSlug,
    stamped: e.stamped,
    total: activeTotalByEvent.get(e.eventId) ?? e.stamped,
  }));

  return {
    totalStamps: stamps.length,
    eventsParticipated: eventMap.size,
    eventCompletion,
  };
}

export async function computeAutoAccolades(
  userId: string,
): Promise<UserAccolades> {
  const userStamps = await db.stamp.findMany({
    where: { userId },
    select: {
      stampedAt: true,
      activity: {
        select: {
          id: true,
          name: true,
          active: true,
          destination: {
            select: {
              event: { select: { id: true, name: true, active: true } },
            },
          },
        },
      },
    },
  });

  if (userStamps.length === 0) {
    return {
      globetrotterEventNames: [],
      earlyBirdActivityNames: [],
      marathoner: false,
      firstStamper: false,
    };
  }

  // Marathoner — ≥3 distinct events stamped at
  const stampedEventIds = new Set(
    userStamps.map((s) => s.activity.destination.event.id),
  );
  const marathoner = stampedEventIds.size >= MARATHONER_THRESHOLD;

  // Globetrotter — for each event we've touched, did we stamp every active activity?
  const globetrotterEventNames: string[] = [];
  for (const eId of stampedEventIds) {
    const event = userStamps.find(
      (s) => s.activity.destination.event.id === eId,
    )!.activity.destination.event;
    if (!event.active) continue;
    const activeActivitiesInEvent = await db.activity.count({
      where: {
        active: true,
        destination: { eventId: eId },
      },
    });
    if (activeActivitiesInEvent === 0) continue;
    const userStampedActiveInEvent = userStamps.filter(
      (s) =>
        s.activity.destination.event.id === eId && s.activity.active,
    ).length;
    if (userStampedActiveInEvent === activeActivitiesInEvent) {
      globetrotterEventNames.push(event.name);
    }
  }

  // Early Bird — user was the first to stamp this activity. One findFirst
  // per activity is fine at V1 scale. If we ever need to optimize, switch
  // to a `SELECT DISTINCT ON (activityId)` raw query.
  const earlyBirdActivityNames: string[] = [];
  for (const s of userStamps) {
    const first = await db.stamp.findFirst({
      where: { activityId: s.activity.id },
      orderBy: { stampedAt: "asc" },
      select: { userId: true },
    });
    if (first?.userId === userId) {
      earlyBirdActivityNames.push(s.activity.name);
    }
  }

  return {
    globetrotterEventNames,
    earlyBirdActivityNames,
    marathoner,
    firstStamper: true,
  };
}

export function accoladeChips(acc: UserAccolades): Accolade[] {
  const list: Accolade[] = [];
  if (acc.firstStamper) {
    list.push({
      kind: "first_stamper",
      label: "First stamp",
      description: "Collected your first stamp.",
    });
  }
  if (acc.marathoner) {
    list.push({
      kind: "marathoner",
      label: "Marathoner",
      description: `Participated in ${MARATHONER_THRESHOLD}+ different events.`,
    });
  }
  for (const ev of acc.globetrotterEventNames) {
    list.push({
      kind: "globetrotter",
      label: "Globetrotter",
      description: `Stamped every active activity in ${ev}.`,
    });
  }
  for (const act of acc.earlyBirdActivityNames) {
    list.push({
      kind: "early_bird",
      label: "Early bird",
      description: `First person to stamp ${act}.`,
    });
  }
  return list;
}

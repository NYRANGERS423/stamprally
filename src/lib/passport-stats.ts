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

export interface ManualAccolade {
  id: string;
  label: string;
  description: string | null;
  emoji: string | null;
  themeId: string | null;
  eventId: string | null;
  eventName: string | null;
  points: number;
  awardedBy: string;
  awardedAt: Date;
}

export async function loadManualAccolades(
  userId: string,
): Promise<ManualAccolade[]> {
  const rows = await db.accolade.findMany({
    where: { userId },
    orderBy: { awardedAt: "desc" },
    select: {
      id: true,
      label: true,
      description: true,
      emoji: true,
      themeId: true,
      eventId: true,
      points: true,
      awardedBy: true,
      awardedAt: true,
      event: { select: { name: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    description: r.description,
    emoji: r.emoji,
    themeId: r.themeId,
    eventId: r.eventId,
    eventName: r.event?.name ?? null,
    points: r.points,
    awardedBy: r.awardedBy,
    awardedAt: r.awardedAt,
  }));
}

export async function computePersonalStats(
  userId: string,
): Promise<PersonalStats> {
  const stamps = await db.stamp.findMany({
    where: { userId },
    select: {
      activityId: true,
      activity: {
        select: {
          event: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  const eventMap = new Map<
    string,
    { eventId: string; eventName: string; eventSlug: string; stamped: number }
  >();
  for (const s of stamps) {
    const ev = s.activity.event;
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
  const activeTotalByEvent = new Map<string, number>();
  if (eventIds.length > 0) {
    const rows = await db.activity.groupBy({
      by: ["eventId"],
      where: { active: true, eventId: { in: eventIds } },
      _count: { _all: true },
    });
    for (const r of rows) {
      activeTotalByEvent.set(r.eventId, r._count._all);
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

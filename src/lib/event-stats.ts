import "server-only";
import { db } from "@/lib/db";

// Per-event distinct-stamper count. Used by <EventCard>'s social line
// ("47 stamped") which only renders when the count is ≥5 — so we don't
// show "0 stamped" / "2 stamped" on quiet events. Returns a Map keyed
// by eventId for O(1) lookup at the call site.
export async function getEventStamperCounts(
  eventIds: string[],
): Promise<Map<string, number>> {
  if (eventIds.length === 0) return new Map();
  const rows = await db.stamp.findMany({
    where: { activity: { eventId: { in: eventIds } } },
    select: { userId: true, activity: { select: { eventId: true } } },
  });
  const setsByEvent = new Map<string, Set<string>>();
  for (const r of rows) {
    const id = r.activity.eventId;
    let set = setsByEvent.get(id);
    if (!set) {
      set = new Set();
      setsByEvent.set(id, set);
    }
    set.add(r.userId);
  }
  const out = new Map<string, number>();
  for (const [eid, set] of setsByEvent) out.set(eid, set.size);
  return out;
}

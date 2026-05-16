import { requireUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { UserHeader } from "@/components/user/UserHeader";
import { EventCard } from "@/components/events/EventCard";
import {
  eventLifecycle,
  eventStateFor,
  type EventState,
} from "@/components/events/EventStatus";
import { getEventStamperCounts } from "@/lib/event-stats";
import { EYEBROW } from "@/lib/ui";

export default async function EventsListPage() {
  const { userId } = await requireUser("/events");

  // Include past/inactive events too so the lifecycle grouping has a
  // "Past" bucket. The page used to filter to active-only; now state
  // is computed per-event from dates + active flag.
  const events = await db.event.findMany({
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    include: {
      activities: { where: { active: true }, select: { id: true } },
    },
  });

  const allActivityIds = events.flatMap((e) => e.activities.map((a) => a.id));
  const [myStamps, stamperCounts] = await Promise.all([
    allActivityIds.length
      ? db.stamp.findMany({
          where: { userId, activityId: { in: allActivityIds } },
          select: { activityId: true },
        })
      : Promise.resolve([] as Array<{ activityId: string }>),
    getEventStamperCounts(events.map((e) => e.id)),
  ]);
  const stampedActivityIds = new Set(myStamps.map((s) => s.activityId));
  const stampedPerEvent = new Map<string, number>();
  for (const e of events) {
    stampedPerEvent.set(
      e.id,
      e.activities.filter((a) => stampedActivityIds.has(a.id)).length,
    );
  }

  const now = new Date();
  interface RenderedEvent {
    id: string;
    slug: string;
    name: string;
    emoji: string | null;
    startDate: Date | null;
    state: EventState;
    myStamps: number;
    totalActivities: number;
    stampersTotal: number;
  }
  const rendered: RenderedEvent[] = events.map((e) => {
    const totalActive = e.activities.length;
    const myCount = stampedPerEvent.get(e.id) ?? 0;
    const allDone = totalActive > 0 && myCount === totalActive;
    const state = eventStateFor(e.active, e.startDate, e.endDate, now, allDone);
    return {
      id: e.id,
      slug: e.slug,
      name: e.name,
      emoji: e.emoji,
      startDate: e.startDate,
      state,
      myStamps: myCount,
      totalActivities: totalActive,
      stampersTotal: stamperCounts.get(e.id) ?? 0,
    };
  });

  const buckets = {
    now: rendered.filter((r) => eventLifecycle(r.state) === "now"),
    coming: rendered.filter((r) => eventLifecycle(r.state) === "coming"),
    past: rendered.filter((r) => eventLifecycle(r.state) === "past"),
  };

  return (
    <>
      <UserHeader />
      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full max-w-3xl space-y-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Company events and your progress in each.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              No events yet. Check back closer to your next company event!
            </div>
          ) : (
            <>
              <Section
                title="Happening now"
                count={buckets.now.length}
                events={buckets.now}
              />
              <Section
                title="Coming up"
                count={buckets.coming.length}
                events={buckets.coming}
              />
              <Section
                title="Past"
                count={buckets.past.length}
                events={buckets.past}
              />
            </>
          )}
        </div>
      </main>
    </>
  );
}

function Section({
  title,
  count,
  events,
}: {
  title: string;
  count: number;
  events: Array<{
    id: string;
    slug: string;
    name: string;
    emoji: string | null;
    startDate: Date | null;
    state: EventState;
    myStamps: number;
    totalActivities: number;
    stampersTotal: number;
  }>;
}) {
  if (events.length === 0) return null;
  return (
    <section>
      <h2 className={`${EYEBROW} mb-3`}>
        {title} <span className="text-stone-400 dark:text-stone-600">·</span>{" "}
        {count}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {events.map((e) => (
          <li key={e.id}>
            <EventCard
              href={`/events/${e.slug}`}
              name={e.name}
              emoji={e.emoji}
              state={e.state}
              startDate={e.startDate}
              myStamps={e.myStamps}
              totalActivities={e.totalActivities}
              stampersTotal={e.stampersTotal}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

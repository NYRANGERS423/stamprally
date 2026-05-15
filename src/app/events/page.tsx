import Link from "next/link";
import { requireUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { logoutAction } from "@/lib/actions/user-auth";

export default async function EventsListPage() {
  const { userId } = await requireUser("/events");

  const events = await db.event.findMany({
    where: { active: true },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { destinations: true } },
      destinations: {
        select: {
          _count: { select: { activities: { where: { active: true } } } },
        },
      },
    },
  });

  // For each event, get the user's stamp count (one query).
  const myStampsByEvent = await db.stamp.groupBy({
    by: ["activityId"],
    where: { userId },
    _count: { _all: true },
  });
  // Reduce per-activity counts into per-event counts.
  const activityIds = myStampsByEvent.map((r) => r.activityId);
  const activityRows = activityIds.length
    ? await db.activity.findMany({
        where: { id: { in: activityIds } },
        select: {
          id: true,
          destination: { select: { eventId: true } },
        },
      })
    : [];
  const actToEvent = new Map(
    activityRows.map((a) => [a.id, a.destination.eventId]),
  );
  const stampedPerEvent = new Map<string, number>();
  for (const r of myStampsByEvent) {
    const eId = actToEvent.get(r.activityId);
    if (!eId) continue;
    stampedPerEvent.set(eId, (stampedPerEvent.get(eId) ?? 0) + r._count._all);
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
              Stamprally
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Events
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/passport"
              className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              My passport
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            No active events right now. Check back closer to your next company
            event!
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {events.map((e) => {
              const totalActive = e.destinations.reduce(
                (sum, d) => sum + d._count.activities,
                0,
              );
              const myCount = stampedPerEvent.get(e.id) ?? 0;
              return (
                <li key={e.id}>
                  <Link
                    href={`/events/${e.slug}`}
                    className="block rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-brand-500 hover:bg-brand-50 active:bg-brand-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-brand-500 dark:hover:bg-brand-900/30"
                  >
                    <div className="text-lg font-semibold">{e.name}</div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                      {e.startDate && (
                        <span>
                          {e.startDate.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      <span>{e._count.destinations} destinations</span>
                      <span className="font-medium text-brand-700 dark:text-brand-400">
                        {myCount} / {totalActive} stamps
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";
import { requireSteward } from "@/lib/auth/steward";
import { db } from "@/lib/db";
import { UserHeader } from "@/components/user/UserHeader";
import {
  EventStatus,
  eventStateFor,
} from "@/components/events/EventStatus";

export default async function StewardEvents() {
  await requireSteward("stamp", "/steward/events");
  const events = await db.event.findMany({
    where: { active: true },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { activities: true } } },
  });
  const now = new Date();

  return (
    <>
      <UserHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4">
          <Link
            href="/steward"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <BackArrow /> Steward
          </Link>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Pick an event</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Only active events are listed. Pick one to see its activities.
        </p>

        {events.length === 0 ? (
          <p className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            No active events right now. Ask an admin to create or activate one.
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {events.map((event) => {
              const state = eventStateFor(
                event.active,
                event.startDate,
                event.endDate,
                now,
              );
              const dateLabel = event.startDate
                ? event.startDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Anytime";
              return (
                <li key={event.id}>
                  <Link
                    href={`/steward/events/${event.id}`}
                    className="group block rounded-2xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                        <span aria-hidden>{event.emoji || "🎪"}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-lg font-semibold leading-tight text-stone-900 group-hover:text-brand-700 dark:text-stone-100 dark:group-hover:text-brand-300">
                            {event.name}
                          </h2>
                          <EventStatus state={state} />
                        </div>
                        <p className="mt-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-stone-500 dark:text-stone-400">
                          <span>{dateLabel}</span>
                          <span aria-hidden className="text-stone-300 dark:text-stone-700">·</span>
                          <span>
                            {event._count.activities}{" "}
                            {event._count.activities === 1
                              ? "activity"
                              : "activities"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}

function BackArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

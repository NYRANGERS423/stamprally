import Link from "next/link";
import { requireKiosk } from "@/lib/auth/kiosk-guard";
import { db } from "@/lib/db";
import { KioskTopBar } from "@/components/kiosk/KioskTopBar";
import {
  EventStatus,
  eventStateFor,
} from "@/components/events/EventStatus";
import { RITUAL_BTN } from "@/lib/ui";

export default async function KioskHome() {
  const { username } = await requireKiosk();
  const events = await db.event.findMany({
    where: { active: true },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { activities: true } } },
  });
  const now = new Date();

  return (
    <>
      <KioskTopBar username={username} active="events" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Pick an event
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Only active events are shown. An admin can flip one back on if
              it&apos;s missing.
            </p>
          </div>
          {/* Give-accolade is a ritual action — use the amber pill */}
          <Link href="/kiosk/give-accolade" className={RITUAL_BTN}>
            <span aria-hidden className="mr-1.5">
              ★
            </span>
            Give accolade
          </Link>
        </div>

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
                    href={`/kiosk/${event.id}`}
                    className="group block rounded-2xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                        <span aria-hidden>🎪</span>
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
                          <span
                            aria-hidden
                            className="text-stone-300 dark:text-stone-700"
                          >
                            ·
                          </span>
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

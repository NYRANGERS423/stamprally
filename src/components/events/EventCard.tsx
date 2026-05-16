import Link from "next/link";
import { EventStatus, type EventState } from "./EventStatus";

// Pass 04 / design-handoff §4.4.1 — event tile. The whole card is an
// <a>. Layout: emoji avatar + name + date (mono caps) + inline 6px
// progress bar with N/M counter, status pill in the top-right.
//
// Events have no theme or emoji field in the schema (yet), so the
// avatar uses a neutral brand-tinted glyph. When events grow an emoji
// field the avatar can swap to it without touching this layout.
//
// The "social count" line ("47 stamped") from the spec is gated to
// N≥5 — omitted in this pass because the events loader doesn't yet
// return stampersTotal. Left a hook for it via the optional prop.

export function EventCard({
  href,
  name,
  state,
  startDate,
  myStamps,
  totalActivities,
  stampersTotal,
}: {
  href: string;
  name: string;
  state: EventState;
  startDate: Date | null;
  myStamps: number;
  totalActivities: number;
  stampersTotal?: number;
}) {
  const pct = totalActivities > 0 ? (myStamps / totalActivities) * 100 : 0;
  const dateLabel = startDate
    ? startDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Anytime";
  const showSocial = stampersTotal !== undefined && stampersTotal >= 5;

  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md focus-visible:shadow-md dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-base text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          <span aria-hidden>🎪</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold leading-tight text-stone-900 group-hover:text-brand-700 dark:text-stone-100 dark:group-hover:text-brand-300">
              {name}
            </h3>
            <EventStatus state={state} />
          </div>
          <p className="mt-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-stone-500 dark:text-stone-400">
            <span>{dateLabel}</span>
            {showSocial && (
              <>
                <span aria-hidden className="text-stone-300 dark:text-stone-700">
                  ·
                </span>
                <span>{stampersTotal} stamped</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"
          role="progressbar"
          aria-valuenow={myStamps}
          aria-valuemin={0}
          aria-valuemax={totalActivities}
          aria-label={`${myStamps} of ${totalActivities} activities stamped`}
        >
          <div
            className={`h-full rounded-full transition-all ${
              myStamps === totalActivities && totalActivities > 0
                ? "bg-emerald-500"
                : "bg-brand-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-xs tabular-nums text-stone-600 dark:text-stone-400">
          {myStamps}
          <span className="text-stone-400 dark:text-stone-600">/</span>
          {totalActivities}
        </span>
      </div>
    </Link>
  );
}

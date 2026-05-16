import Link from "next/link";

// Pass 02 / design-handoff §4.2.2 — inline stat strip under the passport
// card replaces the old 3-up boxed tiles. Each segment links to its
// relevant destination so the strip doubles as in-page navigation.
// Wraps to two lines under ~320px viewport via flex-wrap.
export function StatsStrip({
  stamps,
  events,
  accolades,
}: {
  stamps: number;
  events: number;
  accolades: number;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-stone-600 dark:text-stone-400">
      <StatSegment href="#stamps" value={stamps} label={pluralize(stamps, "stamp")} />
      <Bullet />
      <StatSegment href="/events" value={events} label={pluralize(events, "event")} />
      <Bullet />
      <StatSegment
        href="#accolades"
        value={accolades}
        label={pluralize(accolades, "accolade")}
      />
    </div>
  );
}

function StatSegment({
  href,
  value,
  label,
}: {
  href: string;
  value: number;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-baseline gap-1 rounded-md px-1 py-0.5 hover:bg-stone-100 dark:hover:bg-stone-800"
    >
      <span className="font-medium text-stone-900 tabular-nums dark:text-stone-100">
        {value}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function Bullet() {
  return (
    <span aria-hidden className="text-stone-300 dark:text-stone-700">
      ·
    </span>
  );
}

function pluralize(n: number, singular: string): string {
  return n === 1 ? singular : `${singular}s`;
}

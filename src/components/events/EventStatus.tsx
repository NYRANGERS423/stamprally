// Pass 04 / design-handoff §4.4.1 — status pill for the events list.
// Derives state from startDate / endDate / active. Mono caps text;
// "today" gets a pulsing amber dot to draw the eye. Honors
// prefers-reduced-motion via the global media query.

export type EventState =
  | "today"
  | "soon"
  | "upcoming"
  | "closed"
  | "done";

interface ToneStyle {
  bg: string;
  text: string;
  dot: string;
  pulse: boolean;
}

const TONES: Record<EventState, ToneStyle> = {
  today: {
    bg: "bg-stamp-50 dark:bg-stamp-500/15",
    text: "text-stamp-700 dark:text-stamp-500",
    dot: "bg-stamp-500",
    pulse: true,
  },
  soon: {
    bg: "bg-brand-50 dark:bg-brand-900/30",
    text: "text-brand-700 dark:text-brand-300",
    dot: "bg-brand-500",
    pulse: false,
  },
  upcoming: {
    bg: "bg-stone-100 dark:bg-stone-800",
    text: "text-stone-600 dark:text-stone-400",
    dot: "bg-stone-400",
    pulse: false,
  },
  closed: {
    bg: "bg-stone-100 dark:bg-stone-800",
    text: "text-stone-500 dark:text-stone-500",
    dot: "bg-stone-400",
    pulse: false,
  },
  done: {
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    pulse: false,
  },
};

const LABELS: Record<EventState, string> = {
  today: "TODAY",
  soon: "SOON",
  upcoming: "UPCOMING",
  closed: "CLOSED",
  done: "DONE",
};

export function EventStatus({ state }: { state: EventState }) {
  const tone = TONES[state];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${tone.bg} ${tone.text}`}
    >
      <span
        aria-hidden
        className={`inline-block h-1.5 w-1.5 rounded-full ${tone.dot} ${tone.pulse ? "motion-safe:animate-pulse" : ""}`}
      />
      {LABELS[state]}
    </span>
  );
}

// Compute the lifecycle state from event dates + active flag.
// Used to bucket events into "Happening now / Coming up / Past" and
// to pick the pill tone.
export function eventStateFor(
  active: boolean,
  startDate: Date | null,
  endDate: Date | null,
  now: Date = new Date(),
  doneIfFullProgress = false,
): EventState {
  if (doneIfFullProgress) return "done";
  if (!active) return "closed";

  if (startDate && startDate > now) {
    const daysOut = (startDate.getTime() - now.getTime()) / 86400000;
    if (daysOut <= 7) return "soon";
    return "upcoming";
  }
  if (endDate && endDate < now) return "closed";
  // Active and within window (or no end specified) — count "today" if
  // startDate is today.
  if (startDate && isSameUTCDate(startDate, now)) return "today";
  // In-progress, multi-day event: still flag as today.
  if (startDate && startDate <= now && (!endDate || endDate >= now)) {
    return "today";
  }
  return "upcoming";
}

export function eventLifecycle(state: EventState): "now" | "coming" | "past" {
  if (state === "today" || state === "soon") return "now";
  if (state === "upcoming") return "coming";
  return "past";
}

function isSameUTCDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

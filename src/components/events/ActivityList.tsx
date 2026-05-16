"use client";

import { useEffect, useState } from "react";

// Per fix-list 2026-05-16: activity pills on /events/[slug] become
// clickable, just like accolade chips on the passport. Clicking opens
// a sheet with description, location, and time range.

export interface ActivityForList {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  startTime: Date | string | null;
  endTime: Date | string | null;
  points: number;
  done: boolean;
}

export function ActivityList({ activities }: { activities: ActivityForList[] }) {
  const [open, setOpen] = useState<ActivityForList | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (activities.length === 0) {
    return (
      <p className="py-4 text-sm text-stone-500 dark:text-stone-400">
        No activities yet.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-wrap gap-1.5">
        {activities.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => setOpen(a)}
              className={
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-transform hover:scale-[1.03] active:scale-[0.98] " +
                (a.done
                  ? "border-stamp-600 bg-stamp-50 text-stamp-700 dark:border-stamp-500 dark:bg-stamp-600/20 dark:text-stamp-500"
                  : "border-stone-300 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800")
              }
              aria-label={`View activity: ${a.name}`}
            >
              {a.done ? <CheckDot /> : <EmptyDot />}
              {a.name}
            </button>
          </li>
        ))}
      </ul>
      {open && <ActivityDetailSheet activity={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function ActivityDetailSheet({
  activity,
  onClose,
}: {
  activity: ActivityForList;
  onClose: () => void;
}) {
  const start = parseDate(activity.startTime);
  const end = parseDate(activity.endTime);
  const timeLabel = formatTimeRange(start, end);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={activity.name}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg " +
              (activity.done
                ? "bg-stamp-50 text-stamp-600 ring-2 ring-stamp-500 dark:bg-stamp-600/20 dark:text-stamp-500"
                : "bg-stone-100 text-stone-500 ring-2 ring-stone-300 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-600")
            }
            aria-hidden
          >
            {activity.done ? "✓" : "○"}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-tight">
              {activity.name}
            </h2>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              {activity.points} pt{activity.points === 1 ? "" : "s"}
              {activity.done && " · collected"}
            </p>
          </div>
        </div>

        {activity.description && (
          <p className="mt-4 text-sm text-stone-700 dark:text-stone-300">
            {activity.description}
          </p>
        )}

        <dl className="mt-4 space-y-1 border-t border-stone-200 pt-3 text-xs dark:border-stone-800">
          {activity.location && (
            <Row label="Location" value={activity.location} />
          )}
          {timeLabel && <Row label="When" value={timeLabel} />}
          {!activity.location && !timeLabel && !activity.description && (
            <p className="text-stone-500 dark:text-stone-400">
              No further details yet.
            </p>
          )}
        </dl>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="font-medium text-stone-500 dark:text-stone-400">{label}</dt>
      <dd className="text-right text-stone-900 dark:text-stone-100">{value}</dd>
    </div>
  );
}

function parseDate(d: Date | string | null): Date | null {
  if (!d) return null;
  return typeof d === "string" ? new Date(d) : d;
}

function formatTimeRange(start: Date | null, end: Date | null): string | null {
  if (!start && !end) return null;
  const dateFmt: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  const timeFmt: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  if (start && end) {
    const sameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();
    if (sameDay) {
      return `${start.toLocaleDateString(undefined, dateFmt)}, ${start.toLocaleTimeString(undefined, timeFmt)} – ${end.toLocaleTimeString(undefined, timeFmt)}`;
    }
    return `${start.toLocaleDateString(undefined, dateFmt)} ${start.toLocaleTimeString(undefined, timeFmt)} → ${end.toLocaleDateString(undefined, dateFmt)} ${end.toLocaleTimeString(undefined, timeFmt)}`;
  }
  if (start) {
    return `From ${start.toLocaleDateString(undefined, dateFmt)}, ${start.toLocaleTimeString(undefined, timeFmt)}`;
  }
  return `Until ${end!.toLocaleDateString(undefined, dateFmt)}, ${end!.toLocaleTimeString(undefined, timeFmt)}`;
}

function CheckDot() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function EmptyDot() {
  return (
    <span className="inline-block h-2 w-2 rounded-full border border-current" />
  );
}

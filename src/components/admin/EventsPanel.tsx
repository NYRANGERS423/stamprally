"use client";

import Link from "next/link";
import { useActionState, useTransition } from "react";
import {
  createEventAction,
  toggleEventActiveAction,
  type EventFormState,
} from "@/lib/actions/admin-events";
import {
  CARD,
  CARD_HEADER,
  INPUT_CLASS,
  PRIMARY_BTN,
  SMALL_BTN,
  TEXTAREA_CLASS,
} from "@/lib/ui";

interface EventRow {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  active: boolean;
  _count: { activities: number };
}

const initial: EventFormState = {};

export function EventsPanel({ events }: { events: EventRow[] }) {
  const [state, action, pending] = useActionState(createEventAction, initial);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Top-level containers (e.g. &lsquo;Earth Day 2026&rsquo;). Each event
          holds the activities users stamp.
        </p>
      </div>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">Create event</h2>
        </div>
        <form action={action} className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name *">
              <input
                name="name"
                required
                maxLength={120}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Emoji" hint="Optional. Shown on event tiles.">
              <input
                name="emoji"
                maxLength={8}
                className={INPUT_CLASS + " text-center text-xl"}
                placeholder="🎪"
                autoComplete="off"
              />
            </Field>
            <Field label="Slug" hint="Leave blank to auto-generate">
              <input
                name="slug"
                maxLength={60}
                className={INPUT_CLASS}
                placeholder="earth-day-2026"
              />
            </Field>
            <Field label="Starts on">
              <input name="startDate" type="date" className={INPUT_CLASS} />
            </Field>
            <Field label="Ends on">
              <input name="endDate" type="date" className={INPUT_CLASS} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea
                  name="description"
                  maxLength={2000}
                  rows={2}
                  className={TEXTAREA_CLASS}
                />
              </Field>
            </div>
          </div>
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
          {state.ok && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Event created.
            </p>
          )}
          <button type="submit" disabled={pending} className={PRIMARY_BTN}>
            {pending ? "Creating…" : "Create event"}
          </button>
        </form>
      </section>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">All events ({events.length})</h2>
        </div>
        {events.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
            No events yet — create one above.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {events.map((e) => (
              <EventRowItem key={e.id} ev={e} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EventRowItem({ ev }: { ev: EventRow }) {
  const [pending, start] = useTransition();
  const dates = formatDateRange(ev.startDate, ev.endDate);
  return (
    <li className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className={ev.active ? "" : "opacity-50"}>
        <Link
          href={`/admin/events/${ev.id}`}
          className="text-base font-medium text-stone-900 hover:underline dark:text-stone-100"
        >
          {ev.name}
        </Link>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
          <span className="font-mono">{ev.slug}</span>
          {dates && <span>{dates}</span>}
          <span>{ev._count.activities} activities</span>
          {!ev.active && (
            <span className="font-medium text-red-600 dark:text-red-400">
              Inactive
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/admin/events/${ev.id}`} className={SMALL_BTN}>
          Manage
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await toggleEventActiveAction(ev.id, !ev.active);
            })
          }
          className={SMALL_BTN}
        >
          {ev.active ? "Deactivate" : "Reactivate"}
        </button>
      </div>
    </li>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint && (
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          {hint}
        </p>
      )}
    </div>
  );
}

function formatDateRange(start: Date | null, end: Date | null): string | null {
  if (!start && !end) return null;
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  if (start && end) return `${fmt(start)} → ${fmt(end)}`;
  if (start) return `from ${fmt(start)}`;
  return `until ${fmt(end!)}`;
}

"use client";

import Link from "next/link";
import { useActionState, useTransition } from "react";
import {
  deleteEventAction,
  toggleEventActiveAction,
  updateEventAction,
  type EventFormState,
} from "@/lib/actions/admin-events";
import {
  createDestinationAction,
  deleteDestinationAction,
  type DestinationFormState,
} from "@/lib/actions/admin-destinations";
import {
  CARD,
  CARD_HEADER,
  DANGER_BTN,
  INPUT_CLASS,
  PRIMARY_BTN,
  SECONDARY_BTN,
  SMALL_BTN,
  TEXTAREA_CLASS,
} from "@/lib/ui";

interface EventData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  active: boolean;
}

interface DestinationData {
  id: string;
  name: string;
  description: string | null;
  order: number;
  _count: { activities: number };
}

const initEvt: EventFormState = {};
const initDest: DestinationFormState = {};

export function EventDetailPanel({
  event,
  destinations,
}: {
  event: EventData;
  destinations: DestinationData[];
}) {
  const updateBound = updateEventAction.bind(null, event.id);
  const [eState, eAction, ePending] = useActionState(updateBound, initEvt);

  const createDestBound = createDestinationAction.bind(null, event.id);
  const [dState, dAction, dPending] = useActionState(createDestBound, initDest);

  const [togglePending, startToggle] = useTransition();
  const [deletePending, startDelete] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/events"
            className="text-xs text-stone-500 hover:underline dark:text-stone-400"
          >
            ← All events
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {event.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={togglePending}
            onClick={() =>
              startToggle(async () => {
                await toggleEventActiveAction(event.id, !event.active);
              })
            }
            className={SECONDARY_BTN}
          >
            {event.active ? "Deactivate" : "Reactivate"}
          </button>
          <button
            type="button"
            disabled={deletePending}
            onClick={() => {
              if (
                !confirm(
                  `Delete event "${event.name}"? This also removes its destinations, activities, and stamps. This cannot be undone.`,
                )
              )
                return;
              startDelete(async () => {
                await deleteEventAction(event.id);
              });
            }}
            className={DANGER_BTN + " h-11 px-4 text-sm"}
          >
            Delete event
          </button>
        </div>
      </div>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">Details</h2>
        </div>
        <form action={eAction} className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name *">
              <input
                name="name"
                required
                defaultValue={event.name}
                maxLength={120}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Slug *">
              <input
                name="slug"
                required
                defaultValue={event.slug}
                maxLength={60}
                className={INPUT_CLASS + " font-mono"}
              />
            </Field>
            <Field label="Starts on">
              <input
                name="startDate"
                type="date"
                defaultValue={dateOnly(event.startDate)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Ends on">
              <input
                name="endDate"
                type="date"
                defaultValue={dateOnly(event.endDate)}
                className={INPUT_CLASS}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={event.description ?? ""}
                  maxLength={2000}
                  className={TEXTAREA_CLASS}
                />
              </Field>
            </div>
          </div>
          {eState.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {eState.error}
            </p>
          )}
          {eState.ok && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Saved.
            </p>
          )}
          <button type="submit" disabled={ePending} className={PRIMARY_BTN}>
            {ePending ? "Saving…" : "Save details"}
          </button>
        </form>
      </section>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">Add destination</h2>
        </div>
        <form action={dAction} className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <Field label="Name *">
              <input
                name="name"
                required
                maxLength={120}
                className={INPUT_CLASS}
                placeholder="Lobby"
              />
            </Field>
            <Field label="Display order" hint="Lower = earlier in the list">
              <input
                name="order"
                type="number"
                defaultValue={destinations.length}
                className={INPUT_CLASS}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea
                  name="description"
                  rows={2}
                  maxLength={2000}
                  className={TEXTAREA_CLASS}
                />
              </Field>
            </div>
          </div>
          {dState.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {dState.error}
            </p>
          )}
          {dState.ok && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Destination added.
            </p>
          )}
          <button type="submit" disabled={dPending} className={PRIMARY_BTN}>
            {dPending ? "Adding…" : "Add destination"}
          </button>
        </form>
      </section>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">
            Destinations ({destinations.length})
          </h2>
        </div>
        {destinations.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
            No destinations yet.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {destinations.map((d) => (
              <DestinationRow key={d.id} eventId={event.id} dest={d} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DestinationRow({
  eventId,
  dest,
}: {
  eventId: string;
  dest: DestinationData;
}) {
  const [pending, start] = useTransition();
  return (
    <li className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <Link
          href={`/admin/events/${eventId}/destinations/${dest.id}`}
          className="text-base font-medium hover:underline"
        >
          {dest.name}
        </Link>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
          <span>Order {dest.order}</span>
          <span>{dest._count.activities} activities</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/events/${eventId}/destinations/${dest.id}`}
          className={SMALL_BTN}
        >
          Manage
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (
              !confirm(
                `Delete destination "${dest.name}"? Its activities + stamps go with it. This cannot be undone.`,
              )
            )
              return;
            start(async () => {
              await deleteDestinationAction(eventId, dest.id);
            });
          }}
          className={DANGER_BTN}
        >
          Delete
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

function dateOnly(d: Date | null): string {
  if (!d) return "";
  // Convert to local YYYY-MM-DD for date input.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

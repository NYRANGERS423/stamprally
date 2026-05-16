"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import {
  deleteEventAction,
  toggleEventActiveAction,
  updateEventAction,
  type EventFormState,
} from "@/lib/actions/admin-events";
import {
  createActivityAction,
  deleteActivityAction,
  regenerateActivityCodesAction,
  toggleActivityActiveAction,
  updateActivityAction,
  type ActivityFormState,
} from "@/lib/actions/admin-activities";
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
  emoji: string | null;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  active: boolean;
}

interface ActivityData {
  id: string;
  name: string;
  description: string | null;
  order: number;
  points: number;
  qrToken: string;
  fallbackCode: string;
  active: boolean;
  _count: { stamps: number };
}

const initEvt: EventFormState = {};
const initAct: ActivityFormState = {};

export function EventDetailPanel({
  event,
  activities,
}: {
  event: EventData;
  activities: ActivityData[];
}) {
  const updateBound = updateEventAction.bind(null, event.id);
  const [eState, eAction, ePending] = useActionState(updateBound, initEvt);

  const createBound = createActivityAction.bind(null, event.id);
  const [aState, aAction, aPending] = useActionState(createBound, initAct);

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
                  `Delete event "${event.name}"? This also removes its activities and stamps. This cannot be undone.`,
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
            <Field label="Emoji" hint="Optional. Shown on event tiles.">
              <input
                name="emoji"
                defaultValue={event.emoji ?? ""}
                maxLength={8}
                className={INPUT_CLASS + " text-center text-xl"}
                placeholder="🎪"
                autoComplete="off"
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
          <h2 className="text-sm font-medium">Add activity</h2>
        </div>
        <form action={aAction} className="space-y-3 p-4">
          <ActivityFields defaultOrder={activities.length} />
          {aState.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {aState.error}
            </p>
          )}
          {aState.ok && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Activity added (QR + fallback code generated).
            </p>
          )}
          <button type="submit" disabled={aPending} className={PRIMARY_BTN}>
            {aPending ? "Adding…" : "Add activity"}
          </button>
        </form>
      </section>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">
            Activities ({activities.length})
          </h2>
        </div>
        {activities.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
            No activities yet.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {activities.map((a) => (
              <ActivityRow key={a.id} eventId={event.id} activity={a} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ActivityRow({
  eventId,
  activity,
}: {
  eventId: string;
  activity: ActivityData;
}) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="px-4 py-4">
        <EditActivityForm
          eventId={eventId}
          activity={activity}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }
  return (
    <li className="space-y-2 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className={activity.active ? "" : "opacity-50"}>
          <div className="text-base font-medium">{activity.name}</div>
          {activity.description && (
            <div className="mt-0.5 text-xs text-stone-600 dark:text-stone-400">
              {activity.description}
            </div>
          )}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
            <span>{activity._count.stamps} stamps</span>
            <span>
              Worth{" "}
              <span className="font-mono text-stone-900 dark:text-stone-100">
                {activity.points} pt{activity.points === 1 ? "" : "s"}
              </span>
            </span>
            <span>
              Fallback code:{" "}
              <span className="font-mono text-stone-900 dark:text-stone-100">
                {activity.fallbackCode}
              </span>
            </span>
            {!activity.active && (
              <span className="font-medium text-red-600 dark:text-red-400">
                Inactive
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => setEditing(true)}
            className={SMALL_BTN}
          >
            Edit
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await toggleActivityActiveAction(
                  eventId,
                  activity.id,
                  !activity.active,
                );
              })
            }
            className={SMALL_BTN}
          >
            {activity.active ? "Deactivate" : "Reactivate"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (
                !confirm(
                  `Regenerate QR + fallback code for "${activity.name}"? Previously-printed QR codes will stop working.`,
                )
              )
                return;
              start(async () => {
                await regenerateActivityCodesAction(eventId, activity.id);
              });
            }}
            className={SMALL_BTN}
          >
            Regenerate codes
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (
                !confirm(
                  `Delete activity "${activity.name}"? Its stamps go with it.`,
                )
              )
                return;
              start(async () => {
                await deleteActivityAction(eventId, activity.id);
              });
            }}
            className={DANGER_BTN}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

function EditActivityForm({
  eventId,
  activity,
  onDone,
}: {
  eventId: string;
  activity: ActivityData;
  onDone: () => void;
}) {
  const bound = updateActivityAction.bind(null, eventId, activity.id);
  const [state, action, pending] = useActionState(bound, initAct);
  if (state.ok) {
    queueMicrotask(onDone);
  }
  return (
    <form action={action} className="space-y-3">
      <ActivityFields defaults={activity} />
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className={PRIMARY_BTN}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className={SECONDARY_BTN}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ActivityFields({
  defaults,
  defaultOrder,
}: {
  defaults?: ActivityData;
  defaultOrder?: number;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <Field label="Name *">
          <input
            name="name"
            required
            maxLength={120}
            defaultValue={defaults?.name ?? ""}
            className={INPUT_CLASS}
            placeholder="Coffee bar"
          />
        </Field>
        <Field label="Display order" hint="Lower = earlier">
          <input
            name="order"
            type="number"
            defaultValue={defaults?.order ?? defaultOrder ?? 0}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Points" hint="Counted on leaderboard">
          <input
            name="points"
            type="number"
            min={0}
            max={999}
            defaultValue={defaults?.points ?? 1}
            className={INPUT_CLASS}
          />
        </Field>
      </div>
      <Field label="Description">
        <textarea
          name="description"
          rows={2}
          maxLength={2000}
          defaultValue={defaults?.description ?? ""}
          className={TEXTAREA_CLASS}
          placeholder="Short blurb shown on the kiosk screen"
        />
      </Field>
    </>
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
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

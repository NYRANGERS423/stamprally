"use client";

import Link from "next/link";
import { useActionState, useTransition } from "react";
import {
  deleteDestinationAction,
  updateDestinationAction,
  type DestinationFormState,
} from "@/lib/actions/admin-destinations";
import {
  createActivityAction,
  deleteActivityAction,
  regenerateActivityCodesAction,
  toggleActivityActiveAction,
  type ActivityFormState,
} from "@/lib/actions/admin-activities";
import {
  CARD,
  CARD_HEADER,
  DANGER_BTN,
  INPUT_CLASS,
  PRIMARY_BTN,
  SMALL_BTN,
  TEXTAREA_CLASS,
} from "@/lib/ui";

interface DestData {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  order: number;
}

interface EventLite {
  id: string;
  name: string;
}

interface ActivityData {
  id: string;
  name: string;
  description: string | null;
  qrToken: string;
  fallbackCode: string;
  active: boolean;
  _count: { stamps: number };
}

const initDest: DestinationFormState = {};
const initAct: ActivityFormState = {};

export function DestinationDetailPanel({
  event,
  dest,
  activities,
}: {
  event: EventLite;
  dest: DestData;
  activities: ActivityData[];
}) {
  const updateBound = updateDestinationAction.bind(null, dest.eventId, dest.id);
  const [dState, dAction, dPending] = useActionState(updateBound, initDest);

  const createBound = createActivityAction.bind(null, dest.eventId, dest.id);
  const [aState, aAction, aPending] = useActionState(createBound, initAct);

  const [deletePending, startDelete] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/admin/events/${dest.eventId}`}
            className="text-xs text-stone-500 hover:underline dark:text-stone-400"
          >
            ← {event.name}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {dest.name}
          </h1>
        </div>
        <button
          type="button"
          disabled={deletePending}
          onClick={() => {
            if (
              !confirm(
                `Delete destination "${dest.name}"? Its activities + stamps go with it.`,
              )
            )
              return;
            startDelete(async () => {
              await deleteDestinationAction(dest.eventId, dest.id);
            });
          }}
          className={DANGER_BTN + " h-11 px-4 text-sm"}
        >
          Delete destination
        </button>
      </div>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">Details</h2>
        </div>
        <form action={dAction} className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <Field label="Name *">
              <input
                name="name"
                required
                defaultValue={dest.name}
                maxLength={120}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Display order">
              <input
                name="order"
                type="number"
                defaultValue={dest.order}
                className={INPUT_CLASS}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={dest.description ?? ""}
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
              Saved.
            </p>
          )}
          <button type="submit" disabled={dPending} className={PRIMARY_BTN}>
            {dPending ? "Saving…" : "Save"}
          </button>
        </form>
      </section>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">Add activity</h2>
        </div>
        <form action={aAction} className="space-y-3 p-4">
          <Field label="Name *">
            <input
              name="name"
              required
              maxLength={120}
              className={INPUT_CLASS}
              placeholder="Coffee bar"
            />
          </Field>
          <Field label="Description">
            <textarea
              name="description"
              rows={2}
              maxLength={2000}
              className={TEXTAREA_CLASS}
              placeholder="Short blurb shown on the kiosk screen"
            />
          </Field>
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
              <ActivityRow
                key={a.id}
                eventId={dest.eventId}
                destId={dest.id}
                activity={a}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ActivityRow({
  eventId,
  destId,
  activity,
}: {
  eventId: string;
  destId: string;
  activity: ActivityData;
}) {
  const [pending, start] = useTransition();
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
            onClick={() =>
              start(async () => {
                await toggleActivityActiveAction(
                  eventId,
                  destId,
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
                await regenerateActivityCodesAction(eventId, destId, activity.id);
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
                await deleteActivityAction(eventId, destId, activity.id);
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

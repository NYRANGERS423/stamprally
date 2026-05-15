"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createAccoladeTemplateAction,
  deleteAccoladeTemplateAction,
  toggleAccoladeTemplateActiveAction,
  updateAccoladeTemplateAction,
  type AccoladeTemplateFormState,
} from "@/lib/actions/admin-accolade-templates";
import { THEME_LIST } from "@/lib/themes";
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

interface TemplateRow {
  id: string;
  label: string;
  description: string | null;
  emoji: string | null;
  themeId: string | null;
  eventId: string | null;
  event: { id: string; name: string } | null;
  points: number;
  active: boolean;
}

interface EventOpt {
  id: string;
  name: string;
}

const initial: AccoladeTemplateFormState = {};

export function AccoladeTemplatesPanel({
  templates,
  events,
}: {
  templates: TemplateRow[];
  events: EventOpt[];
}) {
  const [state, action, pending] = useActionState(
    createAccoladeTemplateAction,
    initial,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accolades</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          The catalog of accolades admins can grant to users. Each one can be
          tied to a specific event (so it&apos;s visually badged as that event)
          or kept general. The theme picker controls the chip colour on the
          user&apos;s passport.
        </p>
      </div>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">Add accolade</h2>
        </div>
        <form action={action} className="space-y-3 p-4">
          <TemplateFields events={events} />
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
          {state.ok && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Saved.
            </p>
          )}
          <button type="submit" disabled={pending} className={PRIMARY_BTN}>
            {pending ? "Adding…" : "Add accolade"}
          </button>
        </form>
      </section>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">
            All accolades ({templates.length})
          </h2>
        </div>
        {templates.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
            None yet. Add one above.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {templates.map((t) => (
              <TemplateRowItem key={t.id} tpl={t} events={events} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TemplateRowItem({
  tpl,
  events,
}: {
  tpl: TemplateRow;
  events: EventOpt[];
}) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <li className="px-4 py-4">
        <EditForm
          tpl={tpl}
          events={events}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }
  const themeName =
    tpl.themeId &&
    (THEME_LIST.find((t) => t.id === tpl.themeId)?.label ?? tpl.themeId);
  return (
    <li className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className={tpl.active ? "" : "opacity-50"}>
        <p className="text-sm font-medium">
          {tpl.emoji && <span className="mr-1.5">{tpl.emoji}</span>}
          {tpl.label}
        </p>
        {tpl.description && (
          <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400">
            {tpl.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
          <span>
            Worth{" "}
            <span className="font-mono text-stone-900 dark:text-stone-100">
              {tpl.points} pt{tpl.points === 1 ? "" : "s"}
            </span>
          </span>
          <span>{themeName ? `Theme: ${themeName}` : "Theme: —"}</span>
          <span>
            {tpl.event ? `Event: ${tpl.event.name}` : "Standalone"}
          </span>
          {!tpl.active && (
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
              await toggleAccoladeTemplateActiveAction(tpl.id, !tpl.active);
            })
          }
          className={SMALL_BTN}
        >
          {tpl.active ? "Disable" : "Enable"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (
              !confirm(
                `Delete accolade "${tpl.label}"? Existing granted ones stay on user passports.`,
              )
            )
              return;
            start(async () => {
              await deleteAccoladeTemplateAction(tpl.id);
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

function EditForm({
  tpl,
  events,
  onDone,
}: {
  tpl: TemplateRow;
  events: EventOpt[];
  onDone: () => void;
}) {
  const boundUpdate = updateAccoladeTemplateAction.bind(null, tpl.id);
  const [state, action, pending] = useActionState(boundUpdate, initial);
  // When the update reports ok, exit edit mode on the next render.
  if (state.ok) {
    queueMicrotask(onDone);
  }
  return (
    <form action={action} className="space-y-3">
      <TemplateFields events={events} defaults={tpl} />
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

function TemplateFields({
  events,
  defaults,
}: {
  events: EventOpt[];
  defaults?: TemplateRow;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
        <Field label="Emoji">
          <input
            name="emoji"
            maxLength={8}
            defaultValue={defaults?.emoji ?? ""}
            placeholder="🏆"
            className={INPUT_CLASS + " w-20 text-center text-lg"}
          />
        </Field>
        <Field label="Label *">
          <input
            name="label"
            required
            maxLength={80}
            defaultValue={defaults?.label ?? ""}
            placeholder="Champion of the Day"
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Points" hint="Leaderboard score">
          <input
            name="points"
            type="number"
            min={0}
            max={999}
            defaultValue={defaults?.points ?? 1}
            className={INPUT_CLASS + " w-24 text-center"}
          />
        </Field>
      </div>
      <Field label="Description">
        <textarea
          name="description"
          rows={2}
          maxLength={240}
          defaultValue={defaults?.description ?? ""}
          placeholder="Top stamper at the event."
          className={TEXTAREA_CLASS}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Theme" hint="Controls the chip colour on the passport">
          <select
            name="themeId"
            defaultValue={defaults?.themeId ?? ""}
            className={INPUT_CLASS}
          >
            <option value="">— General (no theme) —</option>
            {THEME_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.emoji} {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tied to event" hint="Leave blank for general use">
          <select
            name="eventId"
            defaultValue={defaults?.eventId ?? ""}
            className={INPUT_CLASS}
          >
            <option value="">— Standalone —</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
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

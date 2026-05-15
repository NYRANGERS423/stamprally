"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { resetUserPasswordAction } from "@/lib/actions/admin-users";
import {
  grantStampAction,
  removeStampAction,
} from "@/lib/actions/admin-stamps";
import {
  grantAccoladeAction,
  revokeAccoladeAction,
  type GrantAccoladeState,
} from "@/lib/actions/admin-accolades";
import { THEME_LIST } from "@/lib/themes";
import {
  CARD,
  CARD_HEADER,
  DANGER_BTN,
  INPUT_CLASS,
  PRIMARY_BTN,
  SECONDARY_BTN,
} from "@/lib/ui";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passportNumber: string;
  photoPath: string | null;
  occupation: string | null;
  mustChangePassword: boolean;
  startDate: Date;
}

interface StampRow {
  id: string;
  stampedAt: Date;
  activity: {
    id: string;
    name: string;
    event: { id: string; name: string };
  };
}

interface AccoladeRow {
  id: string;
  label: string;
  description: string | null;
  emoji: string | null;
  themeId: string | null;
  eventId: string | null;
  awardedBy: string;
  awardedAt: Date;
}

interface ActivityOpt {
  id: string;
  name: string;
  eventName: string;
}

interface TemplateOpt {
  id: string;
  label: string;
  description: string | null;
  emoji: string | null;
  themeId: string | null;
  eventId: string | null;
  eventName: string | null;
}

interface EventOpt {
  id: string;
  name: string;
}

const initAcc: GrantAccoladeState = {};

export function UserDetailPanel({
  user,
  stamps,
  accolades,
  activities,
  templates,
  events,
}: {
  user: UserData;
  stamps: StampRow[];
  accolades: AccoladeRow[];
  activities: ActivityOpt[];
  templates: TemplateOpt[];
  events: EventOpt[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            {user.photoPath ? (
              <Image
                src={`/api/uploads/${user.photoPath}`}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-stone-400">
                {user.firstName[0]}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href="/admin/users"
              className="text-xs text-stone-500 hover:underline dark:text-stone-400"
            >
              ← All users
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {user.email} ·{" "}
              <span className="font-mono">{user.passportNumber}</span>
            </p>
          </div>
        </div>
      </div>

      <ResetPasswordCard userId={user.id} mustChange={user.mustChangePassword} />

      <StampsCard userId={user.id} stamps={stamps} activities={activities} />

      <AccoladesCard
        userId={user.id}
        accolades={accolades}
        templates={templates}
        events={events}
      />
    </div>
  );
}

function ResetPasswordCard({
  userId,
  mustChange,
}: {
  userId: string;
  mustChange: boolean;
}) {
  const [pending, start] = useTransition();
  const [tempPw, setTempPw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className={CARD}>
      <div className={CARD_HEADER}>
        <h2 className="text-sm font-medium">Password</h2>
      </div>
      <div className="space-y-3 p-4">
        {mustChange && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            User must change their password on next login.
          </p>
        )}
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Generate a fresh temporary password. The user will be forced to
          change it the next time they sign in.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (
              !confirm(
                "Reset this user's password? You will see the temporary password once.",
              )
            )
              return;
            setError(null);
            start(async () => {
              const r = await resetUserPasswordAction(userId);
              if (r.ok) setTempPw(r.password);
              else setError(r.error);
            });
          }}
          className={SECONDARY_BTN}
        >
          {pending ? "Resetting…" : "Reset password"}
        </button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {tempPw && (
          <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
            <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
              Share this temporary password with the user (shown once):
            </p>
            <p className="mt-1 select-all font-mono text-lg text-emerald-900 dark:text-emerald-100">
              {tempPw}
            </p>
            <button
              type="button"
              onClick={() => setTempPw(null)}
              className="mt-2 text-xs text-emerald-700 underline dark:text-emerald-400"
            >
              I&apos;ve saved it — hide
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function StampsCard({
  userId,
  stamps,
  activities,
}: {
  userId: string;
  stamps: StampRow[];
  activities: ActivityOpt[];
}) {
  const [grantPending, startGrant] = useTransition();
  const [grantError, setGrantError] = useState<string | null>(null);
  const [grantOk, setGrantOk] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");

  function onGrant() {
    if (!selectedActivity) return;
    setGrantError(null);
    setGrantOk(false);
    startGrant(async () => {
      const r = await grantStampAction(userId, selectedActivity);
      if (r.ok) {
        setGrantOk(true);
        setSelectedActivity("");
      } else setGrantError(r.error);
    });
  }

  return (
    <section className={CARD}>
      <div className={CARD_HEADER}>
        <h2 className="text-sm font-medium">Stamps ({stamps.length})</h2>
      </div>

      <div className="border-b border-stone-200 p-4 dark:border-stone-800">
        <p className="mb-2 text-xs font-medium text-stone-700 dark:text-stone-300">
          Grant a stamp
        </p>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className={INPUT_CLASS + " min-w-[180px] flex-1"}
          >
            <option value="">Pick an activity…</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.eventName} · {a.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedActivity || grantPending}
            onClick={onGrant}
            className={PRIMARY_BTN}
          >
            {grantPending ? "Granting…" : "Grant"}
          </button>
        </div>
        {grantError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {grantError}
          </p>
        )}
        {grantOk && (
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
            Stamp granted.
          </p>
        )}
      </div>

      {stamps.length === 0 ? (
        <p className="px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
          User has no stamps.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 dark:divide-stone-800">
          {stamps.map((s) => (
            <StampRowItem key={s.id} stamp={s} />
          ))}
        </ul>
      )}
    </section>
  );
}

function StampRowItem({ stamp }: { stamp: StampRow }) {
  const [pending, start] = useTransition();
  return (
    <li className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-sm font-medium">{stamp.activity.name}</p>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {stamp.activity.event.name} ·{" "}
          {stamp.stampedAt.toLocaleString()}
        </p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Remove this stamp from the user?")) return;
          start(async () => {
            await removeStampAction(stamp.id);
          });
        }}
        className={DANGER_BTN}
      >
        Remove
      </button>
    </li>
  );
}

function AccoladesCard({
  userId,
  accolades,
  templates,
  events,
}: {
  userId: string;
  accolades: AccoladeRow[];
  templates: TemplateOpt[];
  events: EventOpt[];
}) {
  const bound = grantAccoladeAction.bind(null, userId);
  const [state, action, pending] = useActionState(bound, initAcc);
  const [revokePending, startRevoke] = useTransition();

  function applyTemplate(t: TemplateOpt) {
    const form = document.getElementById(
      "grant-accolade-form",
    ) as HTMLFormElement | null;
    if (!form) return;
    (form.elements.namedItem("label") as HTMLInputElement).value = t.label;
    (form.elements.namedItem("emoji") as HTMLInputElement).value =
      t.emoji ?? "";
    (form.elements.namedItem("description") as HTMLTextAreaElement).value =
      t.description ?? "";
    (form.elements.namedItem("themeId") as HTMLSelectElement).value =
      t.themeId ?? "";
    (form.elements.namedItem("eventId") as HTMLSelectElement).value =
      t.eventId ?? "";
  }

  return (
    <section className={CARD}>
      <div className={CARD_HEADER}>
        <h2 className="text-sm font-medium">
          Accolades ({accolades.length})
        </h2>
      </div>

      <div className="border-b border-stone-200 p-4 dark:border-stone-800">
        {templates.length > 0 && (
          <>
            <p className="mb-2 text-xs font-medium text-stone-700 dark:text-stone-300">
              From catalog ({templates.length})
            </p>
            <ul className="mb-4 flex flex-wrap gap-2">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => applyTemplate(t)}
                    title={
                      t.eventName
                        ? `Tied to ${t.eventName}`
                        : "Standalone accolade"
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-stone-300 bg-stone-50 px-3 text-xs font-medium hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
                  >
                    {t.emoji && <span>{t.emoji}</span>}
                    {t.label}
                    {t.eventName && (
                      <span className="ml-1 text-stone-500 dark:text-stone-400">
                        · {t.eventName}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {templates.length === 0 && (
          <p className="mb-3 rounded-md bg-stone-50 px-3 py-2 text-xs text-stone-600 dark:bg-stone-800/50 dark:text-stone-400">
            No accolades in the catalog yet. Add some at{" "}
            <Link href="/admin/accolades" className="underline">
              Admin → Accolades
            </Link>
            , or fill in a custom one below.
          </p>
        )}

        <form id="grant-accolade-form" action={action} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                Emoji
              </label>
              <input
                name="emoji"
                maxLength={8}
                placeholder="🏆"
                className={INPUT_CLASS + " mt-1 w-20 text-center text-lg"}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                Label *
              </label>
              <input
                name="label"
                required
                maxLength={80}
                placeholder="Champion of the Day"
                className={INPUT_CLASS + " mt-1"}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              maxLength={240}
              placeholder="Top stamper at the event."
              className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                Theme
              </label>
              <select
                name="themeId"
                defaultValue=""
                className={INPUT_CLASS + " mt-1"}
              >
                <option value="">— General —</option>
                {THEME_LIST.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.emoji} {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                Event
              </label>
              <select
                name="eventId"
                defaultValue=""
                className={INPUT_CLASS + " mt-1"}
              >
                <option value="">— Standalone —</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
          {state.ok && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Accolade granted.
            </p>
          )}
          <button type="submit" disabled={pending} className={PRIMARY_BTN}>
            {pending ? "Granting…" : "Grant accolade"}
          </button>
        </form>
      </div>

      {accolades.length === 0 ? (
        <p className="px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
          No accolades granted yet.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 dark:divide-stone-800">
          {accolades.map((a) => (
            <li
              key={a.id}
              className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <p className="text-sm font-medium">
                  {a.emoji && <span className="mr-1.5">{a.emoji}</span>}
                  {a.label}
                </p>
                {a.description && (
                  <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400">
                    {a.description}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                  Granted by {a.awardedBy} ·{" "}
                  {a.awardedAt.toLocaleDateString()}
                  {a.themeId && ` · theme: ${a.themeId}`}
                </p>
              </div>
              <button
                type="button"
                disabled={revokePending}
                onClick={() => {
                  if (!confirm(`Revoke "${a.label}"?`)) return;
                  startRevoke(async () => {
                    await revokeAccoladeAction(a.id);
                  });
                }}
                className={DANGER_BTN}
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

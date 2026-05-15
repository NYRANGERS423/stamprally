"use client";

import { useActionState, useTransition } from "react";
import {
  createKioskUserAction,
  deleteKioskUserAction,
  rotateKioskPasswordAction,
  toggleKioskUserActiveAction,
  type KioskUserFormState,
} from "@/lib/actions/admin-kiosk-users";
import {
  CARD,
  CARD_HEADER,
  DANGER_BTN,
  INPUT_CLASS,
  PRIMARY_BTN,
  SMALL_BTN,
} from "@/lib/ui";

interface KioskUser {
  id: string;
  username: string;
  label: string | null;
  active: boolean;
  createdAt: Date;
}

const initial: KioskUserFormState = {};

export function KioskUsersPanel({ users }: { users: KioskUser[] }) {
  const [state, action, pending] = useActionState(
    createKioskUserAction,
    initial,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kiosk users</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Accounts used at event check-in stations. They can be logged in on
          multiple devices at once. One is usually enough.
        </p>
      </div>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">Create kiosk user</h2>
        </div>
        <form
          action={action}
          className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Field label="Username *" hint="Lowercase, digits, hyphens">
            <input
              name="username"
              required
              minLength={3}
              maxLength={40}
              pattern="[a-z0-9-]+"
              autoComplete="off"
              className={INPUT_CLASS + " font-mono"}
              placeholder="front-desk"
            />
          </Field>
          <Field label="Password *" hint="At least 12 characters">
            <input
              name="password"
              type="password"
              required
              minLength={12}
              maxLength={200}
              autoComplete="new-password"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Label" hint="Internal note (optional)">
            <input
              name="label"
              maxLength={120}
              className={INPUT_CLASS}
              placeholder="Lobby iPad"
            />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            {state.error && (
              <p className="mb-2 text-sm text-red-600 dark:text-red-400">
                {state.error}
              </p>
            )}
            {state.ok && (
              <p className="mb-2 text-sm text-emerald-700 dark:text-emerald-400">
                Kiosk user created.
              </p>
            )}
            <button type="submit" disabled={pending} className={PRIMARY_BTN}>
              {pending ? "Creating…" : "Create kiosk user"}
            </button>
          </div>
        </form>
      </section>

      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">
            All kiosk users ({users.length})
          </h2>
        </div>
        {users.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
            None yet — create one above.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {users.map((u) => (
              <KioskRow key={u.id} user={u} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function KioskRow({ user }: { user: KioskUser }) {
  const [pending, start] = useTransition();
  return (
    <li className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className={user.active ? "" : "opacity-50"}>
        <div className="font-mono text-sm">{user.username}</div>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
          {user.label && <span>{user.label}</span>}
          <span>Created {user.createdAt.toLocaleDateString()}</span>
          {!user.active && (
            <span className="font-medium text-red-600 dark:text-red-400">
              Disabled
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            const newPw = window.prompt(
              `New password for "${user.username}" (min 12 chars):`,
            );
            if (!newPw) return;
            start(async () => {
              const r = await rotateKioskPasswordAction(user.id, newPw);
              if (!r.ok) window.alert(r.error);
              else
                window.alert(
                  "Password updated. Share it with whoever uses this kiosk.",
                );
            });
          }}
          className={SMALL_BTN}
        >
          Rotate password
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await toggleKioskUserActiveAction(user.id, !user.active);
            })
          }
          className={SMALL_BTN}
        >
          {user.active ? "Disable" : "Enable"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Delete kiosk user "${user.username}"?`)) return;
            start(async () => {
              await deleteKioskUserAction(user.id);
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

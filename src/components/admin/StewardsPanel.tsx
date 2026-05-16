"use client";

import { useActionState, useState, useTransition } from "react";
import {
  grantStewardAction,
  revokeStewardAction,
  type StewardFormState,
} from "@/lib/actions/admin-stewards";
import {
  CARD,
  CARD_HEADER,
  EYEBROW,
  INPUT_CLASS,
  PRIMARY_BTN,
  SMALL_BTN,
} from "@/lib/ui";

interface PickableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Grant {
  id: string;
  userId: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  grantedByAdmin: string;
  grantedAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
  revokedReason: string | null;
  canStamp: boolean;
  canGrantAccolades: boolean;
}

const initial: StewardFormState = {};

export function StewardsPanel({
  grantableUsers,
  activeGrants,
  historyGrants,
}: {
  grantableUsers: PickableUser[];
  activeGrants: Grant[];
  historyGrants: Grant[];
}) {
  const [state, action, pending] = useActionState(grantStewardAction, initial);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stewards</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Stewards are users you trust to give out stamps and accolades on
          your behalf at events. Grants can be open-ended or expire on a date
          you pick. Revoke any time.
        </p>
      </div>

      {/* Grant form */}
      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">Grant steward access</h2>
        </div>
        <form action={action} className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="User *" hint="Only users without an active grant are listed.">
              {grantableUsers.length === 0 ? (
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Everyone is already a steward, or there are no users yet.
                </p>
              ) : (
                <select
                  name="userId"
                  required
                  defaultValue=""
                  className={INPUT_CLASS}
                >
                  <option value="" disabled>
                    Pick a user…
                  </option>
                  {grantableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.lastName}, {u.firstName} — {u.email}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Expires" hint="Optional. Blank = no expiration.">
              <input
                name="expiresAt"
                type="datetime-local"
                className={INPUT_CLASS}
              />
            </Field>
          </div>

          <fieldset>
            <legend className={EYEBROW}>Permissions</legend>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              <Checkbox
                name="canStamp"
                label="Stamp (show QR codes for activities)"
                defaultChecked
              />
              <Checkbox
                name="canGrantAccolades"
                label="Grant accolades"
                defaultChecked
              />
            </div>
          </fieldset>

          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
          {state.ok && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Steward access granted.
            </p>
          )}

          <button
            type="submit"
            disabled={pending || grantableUsers.length === 0}
            className={PRIMARY_BTN}
          >
            {pending ? "Granting…" : "Grant"}
          </button>
        </form>
      </section>

      {/* Active stewards */}
      <section className={CARD}>
        <div className={CARD_HEADER}>
          <h2 className="text-sm font-medium">
            Active ({activeGrants.length})
          </h2>
        </div>
        {activeGrants.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
            No active stewards yet — grant the first one above.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {activeGrants.map((g) => (
              <ActiveGrantRow key={g.id} grant={g} />
            ))}
          </ul>
        )}
      </section>

      {/* History */}
      {historyGrants.length > 0 && (
        <section className={CARD}>
          <div className={CARD_HEADER}>
            <h2 className="text-sm font-medium">
              History ({historyGrants.length})
            </h2>
          </div>
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {historyGrants.map((g) => (
              <HistoryGrantRow key={g.id} grant={g} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ActiveGrantRow({ grant }: { grant: Grant }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");

  function doRevoke() {
    start(async () => {
      await revokeStewardAction(grant.id, reason);
      setConfirming(false);
    });
  }

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-medium">
            {grant.user.firstName} {grant.user.lastName}
          </p>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            {grant.user.email}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {grant.canStamp && <PermBadge label="Stamp" />}
            {grant.canGrantAccolades && <PermBadge label="Accolades" />}
          </div>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Granted by{" "}
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {grant.grantedByAdmin}
            </span>{" "}
            on {fmtDate(grant.grantedAt)}.{" "}
            {grant.expiresAt
              ? `Expires ${fmtDate(grant.expiresAt)}.`
              : "No expiration."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {confirming ? (
            <>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                maxLength={200}
                className={INPUT_CLASS + " min-w-[14rem]"}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={doRevoke}
                  disabled={pending}
                  className={SMALL_BTN + " border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"}
                >
                  {pending ? "Revoking…" : "Confirm revoke"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                  className={SMALL_BTN}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className={SMALL_BTN}
            >
              Revoke
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function HistoryGrantRow({ grant }: { grant: Grant }) {
  const now = new Date();
  const wasRevoked = grant.revokedAt !== null;
  const wasExpired =
    !wasRevoked && grant.expiresAt !== null && grant.expiresAt <= now;

  return (
    <li className="px-4 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {grant.user.firstName} {grant.user.lastName}{" "}
            <span className="ml-1 font-normal text-stone-500 dark:text-stone-400">
              {grant.user.email}
            </span>
          </p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Granted by {grant.grantedByAdmin} on {fmtDate(grant.grantedAt)} ·{" "}
            {grant.canStamp ? "Stamp" : ""}
            {grant.canStamp && grant.canGrantAccolades ? " + " : ""}
            {grant.canGrantAccolades ? "Accolades" : ""}
          </p>
          {wasRevoked && (
            <p className="mt-1 text-xs text-red-700 dark:text-red-400">
              Revoked {fmtDate(grant.revokedAt!)}
              {grant.revokedReason ? ` — ${grant.revokedReason}` : ""}
            </p>
          )}
          {wasExpired && (
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
              Expired {fmtDate(grant.expiresAt!)}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

function PermBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
      {label}
    </span>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900"
      />
      <span>{label}</span>
    </label>
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

function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

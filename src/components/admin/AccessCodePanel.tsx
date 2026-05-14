"use client";

import { useActionState, useTransition } from "react";
import {
  createAccessCodeAction,
  toggleAccessCodeAction,
  deleteAccessCodeAction,
  type AccessCodeFormState,
} from "@/lib/actions/admin-access-codes";

interface AccessCode {
  id: string;
  code: string;
  label: string | null;
  enabled: boolean;
  expiresAt: Date | null;
  maxUses: number | null;
  usesCount: number;
  createdAt: Date;
}

const initial: AccessCodeFormState = {};

export function AccessCodePanel({ codes }: { codes: AccessCode[] }) {
  const [state, action, pending] = useActionState(
    createAccessCodeAction,
    initial,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Access codes</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Codes required at signup. Disable or delete to close signups.
        </p>
      </div>

      <section className="rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-800">
          <h2 className="text-sm font-medium">Create code</h2>
        </div>
        <form
          action={action}
          className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Field label="Code *" hint="A–Z, 0–9, hyphens">
            <input
              name="code"
              required
              placeholder="EARTH-2026"
              className={inputClass}
              maxLength={60}
            />
          </Field>
          <Field label="Label" hint="Internal note (optional)">
            <input
              name="label"
              placeholder="Earth Day onboarding"
              className={inputClass}
              maxLength={120}
            />
          </Field>
          <Field label="Expires at" hint="Optional">
            <input
              name="expiresAt"
              type="datetime-local"
              className={inputClass}
            />
          </Field>
          <Field label="Max uses" hint="Blank = unlimited">
            <input
              name="maxUses"
              type="number"
              min={1}
              placeholder=""
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50"
            >
              {pending ? "Creating…" : "Create code"}
            </button>
          </div>
        </form>
        {state.error && (
          <p className="border-t border-stone-200 px-4 py-3 text-sm text-red-600 dark:border-stone-800 dark:text-red-400">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="border-t border-stone-200 px-4 py-3 text-sm text-emerald-700 dark:border-stone-800 dark:text-emerald-400">
            Code created.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-800">
          <h2 className="text-sm font-medium">All codes ({codes.length})</h2>
        </div>
        {codes.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
            No codes yet — create one above.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {codes.map((c) => (
              <CodeRow key={c.id} code={c} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CodeRow({ code }: { code: AccessCode }) {
  const [pending, start] = useTransition();
  const expired = code.expiresAt ? code.expiresAt < new Date() : false;
  const exhausted =
    code.maxUses != null && code.usesCount >= code.maxUses;
  const dim = !code.enabled || expired || exhausted;
  return (
    <li className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className={dim ? "opacity-50" : ""}>
        <div className="font-mono text-sm">{code.code}</div>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
          {code.label && <span>{code.label}</span>}
          <span>
            Used {code.usesCount}
            {code.maxUses != null ? ` / ${code.maxUses}` : ""}
          </span>
          {code.expiresAt && (
            <span>
              {expired ? "Expired" : "Expires"}{" "}
              {new Date(code.expiresAt).toLocaleString()}
            </span>
          )}
          {!code.enabled && (
            <span className="font-medium text-red-600 dark:text-red-400">
              Disabled
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await toggleAccessCodeAction(code.id, !code.enabled);
            })
          }
          className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-3 text-xs font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          {code.enabled ? "Disable" : "Enable"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Delete code "${code.code}"? This can't be undone.`))
              return;
            start(async () => {
              await deleteAccessCodeAction(code.id);
            });
          }}
          className="inline-flex h-10 items-center justify-center rounded-md border border-red-300 px-3 text-xs font-medium text-red-700 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

const inputClass =
  "block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900";

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

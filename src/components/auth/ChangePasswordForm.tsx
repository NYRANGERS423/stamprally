"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  type AuthFormState,
} from "@/lib/actions/user-auth";

const initial: AuthFormState = {};
const inputClass =
  "mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(
    changePasswordAction,
    initial,
  );
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      <Field label="Current password" error={fe.currentPassword}>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>
      <Field
        label="New password"
        error={fe.newPassword}
        hint="At least 12 characters"
      >
        <input
          name="newPassword"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      <Field label="Confirm new password" error={fe.newPasswordConfirm}>
        <input
          name="newPasswordConfirm"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import {
  updateProfileAction,
  type PassportEditState,
} from "@/lib/actions/passport-edit";

const initial: PassportEditState = {};
const inputClass =
  "mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900";

export function ProfileForm({
  firstName,
  lastName,
  occupation,
}: {
  firstName: string;
  lastName: string;
  occupation: string | null;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            First name
          </label>
          <input
            name="firstName"
            defaultValue={firstName}
            required
            maxLength={80}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Last name
          </label>
          <input
            name="lastName"
            defaultValue={lastName}
            required
            maxLength={80}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Working title
        </label>
        <input
          name="occupation"
          defaultValue={occupation ?? ""}
          maxLength={120}
          placeholder="e.g. Coffee Diplomat"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Your job title or role at the company.
        </p>
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Saved.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

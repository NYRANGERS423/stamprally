"use client";

import { useActionState } from "react";
import {
  updateSiteTitleAction,
  type SettingsFormState,
} from "@/lib/actions/admin-settings";

const initial: SettingsFormState = {};
const inputClass =
  "mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900";

export function SiteTitleForm({ current }: { current: string | null }) {
  const [state, action, pending] = useActionState(
    updateSiteTitleAction,
    initial,
  );
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Centered header title
        </label>
        <input
          name="siteTitle"
          defaultValue={current ?? ""}
          maxLength={80}
          placeholder="e.g. ACME Stamps 2026"
          className={inputClass}
          autoComplete="off"
        />
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Appears in the center of the top bar on every page. Leave blank for
          the default &lsquo;Stamprally&rsquo; wordmark.
        </p>
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">Saved.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save title"}
      </button>
    </form>
  );
}

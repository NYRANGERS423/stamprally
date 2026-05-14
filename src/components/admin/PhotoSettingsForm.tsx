"use client";

import { useActionState } from "react";
import {
  updatePhotoSettingsAction,
  type SettingsFormState,
} from "@/lib/actions/admin-settings";

const initial: SettingsFormState = {};
const inputClass =
  "mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900";

export function PhotoSettingsForm({
  maxMb,
  outputPx,
  outputQuality,
}: {
  maxMb: number;
  outputPx: number;
  outputQuality: number;
}) {
  const [state, action, pending] = useActionState(
    updatePhotoSettingsAction,
    initial,
  );
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-3">
      <Field label="Max upload (MB)" hint="Between 1 and 50">
        <input
          name="maxMb"
          type="number"
          min={1}
          max={50}
          defaultValue={maxMb}
          required
          className={inputClass}
        />
      </Field>
      <Field label="Output size (px)" hint="Square; 200–2000">
        <input
          name="outputPx"
          type="number"
          min={200}
          max={2000}
          step={50}
          defaultValue={outputPx}
          required
          className={inputClass}
        />
      </Field>
      <Field label="JPEG quality" hint="40–100; 80 is a good default">
        <input
          name="outputQuality"
          type="number"
          min={40}
          max={100}
          defaultValue={outputQuality}
          required
          className={inputClass}
        />
      </Field>
      <div className="sm:col-span-3">
        {state.error && (
          <p className="mb-2 text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="mb-2 text-sm text-emerald-700 dark:text-emerald-400">
            Settings saved. New uploads use these values immediately.
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
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
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          {hint}
        </p>
      )}
    </div>
  );
}

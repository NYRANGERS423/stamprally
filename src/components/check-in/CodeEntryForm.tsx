"use client";

import { useActionState } from "react";
import { stampByCodeAction, type CodeEntryState } from "@/lib/actions/check-in";
import { PRIMARY_BTN } from "@/lib/ui";

const initial: CodeEntryState = {};

export function CodeEntryForm() {
  const [state, action, pending] = useActionState(stampByCodeAction, initial);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="code"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Activity code
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          autoFocus
          required
          minLength={4}
          maxLength={8}
          placeholder="0000"
          className="mt-1 block h-16 w-full rounded-md border-2 border-stone-300 bg-white text-center font-mono text-4xl font-bold tracking-[0.4em] shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900"
        />
        <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
          Look at the kiosk screen — the code is shown under the QR.
        </p>
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={PRIMARY_BTN + " w-full"}
      >
        {pending ? "Checking…" : "Collect stamp"}
      </button>
    </form>
  );
}

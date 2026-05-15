"use client";

import { useActionState } from "react";
import {
  updateThemeAction,
  type ThemeFormState,
} from "@/lib/actions/passport-theme";
import { THEME_LIST, type ThemeId } from "@/lib/themes";

const initial: ThemeFormState = {};

export function ThemeSelector({ current }: { current: ThemeId }) {
  const [state, action, pending] = useActionState(updateThemeAction, initial);
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Pick a look for your passport.
      </p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {THEME_LIST.map((t) => {
          const selected = t.id === current;
          return (
            <li key={t.id}>
              <label
                className={
                  "block cursor-pointer overflow-hidden rounded-xl border-2 transition-all " +
                  (selected
                    ? "border-brand-600 ring-2 ring-brand-300 dark:border-brand-400 dark:ring-brand-700"
                    : "border-stone-200 hover:border-stone-400 dark:border-stone-700 dark:hover:border-stone-500")
                }
              >
                <input
                  type="radio"
                  name="theme"
                  value={t.id}
                  defaultChecked={selected}
                  className="sr-only"
                />
                <div
                  className={`h-16 bg-gradient-to-br ${t.swatchGradient}`}
                  aria-hidden
                />
                <div className="space-y-1 bg-white p-3 dark:bg-stone-900">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      <span className="mr-1" aria-hidden>
                        {t.emoji}
                      </span>
                      {t.label}
                    </span>
                    {selected && (
                      <span className="text-xs font-medium text-brand-700 dark:text-brand-400">
                        ✓ Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {t.description}
                  </p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Theme saved.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save theme"}
      </button>
    </form>
  );
}

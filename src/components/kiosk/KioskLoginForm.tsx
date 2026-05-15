"use client";

import { useActionState } from "react";
import {
  kioskLoginAction,
  type KioskLoginState,
} from "@/lib/actions/kiosk-auth";
import { INPUT_CLASS, PRIMARY_BTN } from "@/lib/ui";

const initial: KioskLoginState = {};

export function KioskLoginForm() {
  const [state, action, pending] = useActionState(kioskLoginAction, initial);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="off"
          required
          className={INPUT_CLASS + " mt-1 font-mono"}
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={INPUT_CLASS + " mt-1"}
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={PRIMARY_BTN + " w-full"}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

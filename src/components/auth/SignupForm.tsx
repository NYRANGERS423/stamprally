"use client";

import { useActionState } from "react";
import { signupAction, type AuthFormState } from "@/lib/actions/user-auth";

const initial: AuthFormState = {};

const inputClass =
  "mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900";

interface Option {
  id: string;
  name: string;
}

export function SignupForm({
  departments,
  companies,
  regions,
}: {
  departments: Option[];
  companies: Option[];
  regions: Option[];
}) {
  const [state, action, pending] = useActionState(signupAction, initial);
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      <Section title="Access">
        <Field label="Access code" error={fe.accessCode}>
          <input
            name="accessCode"
            required
            autoComplete="off"
            className={inputClass + " font-mono uppercase"}
          />
        </Field>
      </Section>

      <Section title="Account">
        <Field label="Email" error={fe.email}>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </Field>
        <Field
          label="Password"
          error={fe.password}
          hint="At least 12 characters"
        >
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={12}
            className={inputClass}
          />
        </Field>
        <Field label="Confirm password" error={fe.passwordConfirm}>
          <input
            name="passwordConfirm"
            type="password"
            required
            autoComplete="new-password"
            minLength={12}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Passport details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={fe.firstName}>
            <input
              name="firstName"
              required
              maxLength={80}
              className={inputClass}
            />
          </Field>
          <Field label="Last name" error={fe.lastName}>
            <input
              name="lastName"
              required
              maxLength={80}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Department" error={fe.departmentId}>
          <select name="departmentId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Select your department
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Company" error={fe.companyId}>
          <select name="companyId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Select your company
            </option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Region" error={fe.regionId}>
          <select name="regionId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Select your region
            </option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Start date at the company"
          error={fe.startDate}
          hint="Locked once you sign up — your &lsquo;Citizen since&rsquo;"
        >
          <input
            name="startDate"
            type="date"
            required
            className={inputClass}
          />
        </Field>
        <Field
          label="Working title"
          error={fe.occupation}
          hint="Have fun with it — e.g. &lsquo;Coffee Diplomat&rsquo;, &lsquo;Spreadsheet Wizard&rsquo;"
        >
          <input
            name="occupation"
            maxLength={120}
            className={inputClass}
            placeholder="Coffee Diplomat"
          />
        </Field>
      </Section>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Creating passport…" : "Create my passport"}
      </button>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-mono text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
        {title}
      </legend>
      {children}
    </fieldset>
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

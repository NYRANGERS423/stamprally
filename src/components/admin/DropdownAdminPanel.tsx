"use client";

import { useActionState, useTransition } from "react";
import {
  createDropdownAction,
  toggleDropdownAction,
  type DropdownKind,
  type DropdownFormState,
} from "@/lib/actions/admin-dropdowns";

interface Item {
  id: string;
  name: string;
  active: boolean;
}

const initial: DropdownFormState = {};

export function DropdownAdminPanel({
  kind,
  title,
  description,
  items,
}: {
  kind: DropdownKind;
  title: string;
  description: string;
  items: Item[];
}) {
  const boundCreate = createDropdownAction.bind(null, kind);
  const [state, action, pending] = useActionState(boundCreate, initial);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {description}
        </p>
      </div>

      <section className="rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-800">
          <h2 className="text-sm font-medium">Add new</h2>
        </div>
        <form action={action} className="flex flex-col gap-2 p-4 sm:flex-row">
          <input
            name="name"
            placeholder={`e.g. ${exampleFor(kind)}`}
            required
            maxLength={120}
            className="h-11 flex-1 rounded-md border border-stone-300 bg-white px-3 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50"
          >
            {pending ? "Adding…" : "Add"}
          </button>
        </form>
        {state.error && (
          <p className="border-t border-stone-200 px-4 py-3 text-sm text-red-600 dark:border-stone-800 dark:text-red-400">
            {state.error}
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-800">
          <h2 className="text-sm font-medium">
            All {title.toLowerCase()} ({items.length})
          </h2>
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-500 dark:text-stone-400">
            None yet — add one above.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {items.map((item) => (
              <DropdownRow key={item.id} kind={kind} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DropdownRow({ kind, item }: { kind: DropdownKind; item: Item }) {
  const [pending, start] = useTransition();
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <span
        className={
          "text-sm " +
          (item.active
            ? "text-stone-900 dark:text-stone-100"
            : "text-stone-400 line-through")
        }
      >
        {item.name}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await toggleDropdownAction(kind, item.id, !item.active);
          })
        }
        className={
          "inline-flex h-10 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors disabled:opacity-50 " +
          (item.active
            ? "border border-stone-300 text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            : "border border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300 dark:hover:bg-brand-900/50")
        }
      >
        {item.active ? "Deactivate" : "Reactivate"}
      </button>
    </li>
  );
}

function exampleFor(kind: DropdownKind): string {
  switch (kind) {
    case "department":
      return "Engineering";
    case "company":
      return "APM Terminals";
    case "region":
      return "Netherlands";
  }
}

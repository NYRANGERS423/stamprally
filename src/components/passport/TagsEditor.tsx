"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addTagAction,
  removeTagAction,
  type TagFormState,
} from "@/lib/actions/passport-tags";
import {
  SUGGESTED_TAGS,
  displayTagLabel,
  placeholderFor,
} from "@/lib/passport-tags";

interface Tag {
  id: string;
  key: string;
  value: string;
}

const initial: TagFormState = {};
const CUSTOM = "__custom__";
const inputClass =
  "h-11 w-full rounded-md border border-stone-300 bg-white px-3 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900";

export function TagsEditor({ tags }: { tags: Tag[] }) {
  const [state, action, pending] = useActionState(addTagAction, initial);
  const [selected, setSelected] = useState<string>(SUGGESTED_TAGS[0]?.key ?? CUSTOM);
  const isCustom = selected === CUSTOM;

  return (
    <div className="space-y-4">
      {tags.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          No tags yet — add a few fun details below.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
        </ul>
      )}

      <form action={action} className="space-y-3 border-t border-stone-200 pt-4 dark:border-stone-800">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
              Tag
            </label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className={inputClass + " mt-1"}
            >
              {SUGGESTED_TAGS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
              <option value={CUSTOM}>Custom…</option>
            </select>
            {isCustom ? (
              <input
                name="key"
                placeholder="e.g. Hair color"
                required
                maxLength={40}
                className={inputClass + " mt-2"}
              />
            ) : (
              <input type="hidden" name="key" value={selected} />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
              Value
            </label>
            <input
              name="value"
              placeholder={isCustom ? "" : placeholderFor(selected)}
              required
              maxLength={120}
              className={inputClass + " mt-1"}
            />
          </div>
        </div>
        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        {state.ok && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Tag saved.
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save tag"}
        </button>
      </form>
    </div>
  );
}

function TagChip({ tag }: { tag: Tag }) {
  const [pending, start] = useTransition();
  return (
    <li
      className={
        "inline-flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 py-1 pl-3 pr-1 text-sm dark:border-stone-700 dark:bg-stone-800 " +
        (pending ? "opacity-50" : "")
      }
    >
      <span>
        <span className="text-stone-500 dark:text-stone-400">
          {displayTagLabel(tag.key)}:
        </span>{" "}
        <span className="font-medium text-stone-900 dark:text-stone-100">
          {tag.value}
        </span>
      </span>
      <button
        type="button"
        disabled={pending}
        aria-label={`Remove ${displayTagLabel(tag.key)}`}
        onClick={() =>
          start(async () => {
            await removeTagAction(tag.id);
          })
        }
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:bg-stone-200 hover:text-stone-900 active:bg-stone-300 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-100"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>
    </li>
  );
}

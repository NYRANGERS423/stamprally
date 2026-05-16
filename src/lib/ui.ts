// Shared form-control class strings so we don't repeat the same Tailwind
// soup across every admin form.

export const INPUT_CLASS =
  "h-11 w-full rounded-md border border-stone-300 bg-white px-3 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900";

export const TEXTAREA_CLASS =
  "block w-full rounded-md border border-stone-300 bg-white px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-700 dark:bg-stone-900";

export const PRIMARY_BTN =
  "inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 disabled:opacity-50";

// Pass 01 / design-handoff §4.1.2: amber pill reserved for the stamp
// moment and accolade CTAs ("amber = ritual"). Same dimensions as
// PRIMARY_BTN — only the shape and tone change.
export const RITUAL_BTN =
  "inline-flex h-11 items-center justify-center rounded-full bg-stamp-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-stamp-500 active:bg-stamp-500 disabled:opacity-50";

export const SECONDARY_BTN =
  "inline-flex h-11 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800";

export const SMALL_BTN =
  "inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-3 text-xs font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800";

export const DANGER_BTN =
  "inline-flex h-10 items-center justify-center rounded-md border border-red-300 px-3 text-xs font-medium text-red-700 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40";

export const CARD =
  "overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900";

export const CARD_HEADER =
  "border-b border-stone-200 px-4 py-3 dark:border-stone-800";

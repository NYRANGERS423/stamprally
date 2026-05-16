import Link from "next/link";

// Pass 01 / design-handoff §4.1.2 — one unified segmented-control shape.
// Pill track on stone-100; active item is a white pill with a soft shadow;
// inactive items are stone-500 text with a stone-200 hover shift.
// Used by user top-nav, kiosk top-bar, and leaderboard board switcher.
export const SEGMENTED_TRACK =
  "inline-flex items-center gap-0.5 rounded-full bg-stone-100 p-[3px] dark:bg-stone-800";

const ITEM_BASE =
  "inline-flex h-9 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors";

const ITEM_ACTIVE =
  "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-50";

const ITEM_INACTIVE =
  "text-stone-500 hover:bg-stone-200 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-700/60 dark:hover:text-stone-200";

export function segmentedItemClass(active: boolean): string {
  return `${ITEM_BASE} ${active ? ITEM_ACTIVE : ITEM_INACTIVE}`;
}

export interface SegmentedItem<V extends string = string> {
  value: V;
  label: string;
  href: string;
  ariaLabel?: string;
}

export function Segmented<V extends string = string>({
  items,
  active,
  ariaLabel,
  className,
}: {
  items: SegmentedItem<V>[];
  active: V | null | undefined;
  ariaLabel?: string;
  className?: string;
}) {
  const trackClass = className ? `${SEGMENTED_TRACK} ${className}` : SEGMENTED_TRACK;
  return (
    <div role="tablist" aria-label={ariaLabel} className={trackClass}>
      {items.map((item) => {
        const isActive = item.value === active;
        return (
          <Link
            key={item.value}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            aria-label={item.ariaLabel}
            className={segmentedItemClass(isActive)}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

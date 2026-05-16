import Link from "next/link";

// URL-driven page flipper. Renders Prev / "X of Y" / Next.
// Callers compute the href for each page and pass it through so the
// flipper has no opinion about query-param shape (different pages
// use different param names: ?stampPage, ?activityPage, etc).
//
// Hidden when there's only one page so it doesn't visually
// noise-up tiny passports / events.

export function PageFlipper({
  current,
  total,
  buildHref,
  label,
  scrollAnchor,
}: {
  current: number;
  total: number;
  buildHref: (page: number) => string;
  label?: string;
  // Optional in-page anchor to scroll to on prev/next so the user
  // doesn't jump to the top of the page when flipping.
  scrollAnchor?: string;
}) {
  if (total <= 1) return null;
  const prev = current > 1 ? current - 1 : null;
  const next = current < total ? current + 1 : null;
  const anchorSuffix = scrollAnchor ? `#${scrollAnchor}` : "";

  return (
    <nav
      aria-label={label ?? "Pagination"}
      className="mt-4 flex items-center justify-between gap-3 px-1"
    >
      {prev ? (
        <Link
          href={`${buildHref(prev)}${anchorSuffix}`}
          scroll={false}
          aria-label="Previous page"
          className="inline-flex h-9 items-center gap-1 rounded-full border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          <span aria-hidden>←</span> Prev
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 text-xs font-medium text-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-600">
          <span aria-hidden>←</span> Prev
        </span>
      )}

      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
        Page {current} of {total}
      </span>

      {next ? (
        <Link
          href={`${buildHref(next)}${anchorSuffix}`}
          scroll={false}
          aria-label="Next page"
          className="inline-flex h-9 items-center gap-1 rounded-full border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          Next <span aria-hidden>→</span>
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 text-xs font-medium text-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-600">
          Next <span aria-hidden>→</span>
        </span>
      )}
    </nav>
  );
}

// Clamp a parsed page number into [1, total]. Returns 1 when total
// is 0 (empty list — caller still renders an empty state).
export function clampPage(raw: string | undefined, total: number): number {
  if (total <= 0) return 1;
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, total);
}

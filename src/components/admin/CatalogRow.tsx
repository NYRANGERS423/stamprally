import Link from "next/link";
import { EYEBROW } from "@/lib/ui";

// Pass 05 / design-handoff §4.5.2 — 40px catalog row.
// mono caps label + serif count + arrow. Hover: bg-stone-50.
// Used for Companies / Departments / Regions / Kiosk users / Access
// codes / Accolade templates (anything that's a managed list).

export function CatalogRow({
  label,
  count,
  href,
}: {
  label: string;
  count: number | string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-10 items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-3 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800/60"
    >
      <span className={EYEBROW}>{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-serif text-base font-medium tabular-nums text-stone-900 dark:text-stone-100">
          {count}
        </span>
        <span aria-hidden className="text-stone-300 dark:text-stone-600">
          →
        </span>
      </span>
    </Link>
  );
}

import Link from "next/link";
import { EYEBROW } from "@/lib/ui";

// Pass 05 / design-handoff §4.5.2 — hero KPI tile for the admin
// dashboard. Big serif tabular number, mono caps eyebrow, optional
// hint underneath. Hover lifts via box-shadow only (no translate,
// per Pass 04 motion guidance — keep the surface still).

export type KpiTone = "brand" | "stamp" | "ok";

const TONE_HOVER: Record<KpiTone, string> = {
  brand:
    "hover:shadow-[0_0_0_1px_rgba(37,99,235,1),0_8px_24px_-12px_rgba(28,25,23,0.18)]",
  stamp:
    "hover:shadow-[0_0_0_1px_rgba(217,119,6,1),0_8px_24px_-12px_rgba(28,25,23,0.18)]",
  ok: "hover:shadow-[0_0_0_1px_rgba(16,185,129,1),0_8px_24px_-12px_rgba(28,25,23,0.18)]",
};

export function KpiTile({
  label,
  value,
  hint,
  tone,
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone: KpiTone;
  href?: string;
}) {
  const inner = (
    <div
      className={`flex h-full min-h-[140px] flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 transition-shadow dark:border-stone-800 dark:bg-stone-900 ${href ? TONE_HOVER[tone] : ""}`}
    >
      <p className={EYEBROW}>{label}</p>
      <div>
        <p className="font-serif text-5xl font-medium leading-none tracking-tight tabular-nums text-stone-900 dark:text-stone-100">
          {value}
        </p>
        {hint && (
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

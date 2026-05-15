"use client";

import { useEffect, useState } from "react";
import { THEMES } from "@/lib/themes";

interface Accolade {
  id: string;
  label: string;
  description: string | null;
  emoji: string | null;
  themeId: string | null;
  eventName: string | null;
  points: number;
  awardedBy: string;
  awardedAt: Date | string;
}

export function AccoladeList({
  accolades,
  defaultThemeId,
}: {
  accolades: Accolade[];
  defaultThemeId: string;
}) {
  const [open, setOpen] = useState<Accolade | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <ul className="flex flex-wrap gap-2 p-4">
        {accolades.map((a) => {
          const chipTheme = chipThemeFor(a.themeId, defaultThemeId);
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setOpen(a)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98] ${chipTheme}`}
                aria-label={`View accolade: ${a.label}`}
              >
                {a.emoji && <span>{a.emoji}</span>}
                {a.label}
              </button>
            </li>
          );
        })}
      </ul>
      {open && (
        <DetailModal
          accolade={open}
          chipTheme={chipThemeFor(open.themeId, defaultThemeId)}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

function chipThemeFor(
  themeId: string | null,
  defaultThemeId: string,
): string {
  if (themeId && themeId in THEMES) {
    return THEMES[themeId as keyof typeof THEMES].tagChipClass;
  }
  if (defaultThemeId in THEMES) {
    return THEMES[defaultThemeId as keyof typeof THEMES].tagChipClass;
  }
  return THEMES.default.tagChipClass;
}

function DetailModal({
  accolade,
  chipTheme,
  onClose,
}: {
  accolade: Accolade;
  chipTheme: string;
  onClose: () => void;
}) {
  const awardedAtDate =
    typeof accolade.awardedAt === "string"
      ? new Date(accolade.awardedAt)
      : accolade.awardedAt;
  const grantedByLabel = (() => {
    if (accolade.awardedBy.startsWith("kiosk:")) {
      return `Kiosk @${accolade.awardedBy.slice("kiosk:".length)}`;
    }
    return accolade.awardedBy;
  })();
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={accolade.label}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl ${chipTheme}`}
          >
            {accolade.emoji ?? "★"}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-tight">
              {accolade.label}
            </h2>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              {accolade.eventName ?? "Standalone"} ·{" "}
              {accolade.points} pt{accolade.points === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        {accolade.description && (
          <p className="mt-4 text-sm text-stone-700 dark:text-stone-300">
            {accolade.description}
          </p>
        )}
        <dl className="mt-4 space-y-1 border-t border-stone-200 pt-3 text-xs dark:border-stone-800">
          <div className="flex justify-between gap-3">
            <dt className="font-medium text-stone-500 dark:text-stone-400">
              Awarded
            </dt>
            <dd className="text-stone-900 dark:text-stone-100">
              {awardedAtDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="font-medium text-stone-500 dark:text-stone-400">
              Granted by
            </dt>
            <dd className="text-stone-900 dark:text-stone-100">
              {grantedByLabel}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export type FlashMode = "stamped" | "already" | "not_found" | "inactive";

interface Tone {
  ringClass: string;
  bgClass: string;
  iconBgClass: string;
  iconColorClass: string;
  textColorClass: string;
  icon: React.ReactNode;
}

const TONES: Record<FlashMode, Tone> = {
  stamped: {
    ringClass:
      "border-emerald-500 dark:border-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/60",
    iconBgClass: "bg-emerald-500",
    iconColorClass: "text-white",
    textColorClass: "text-emerald-900 dark:text-emerald-100",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 12l5 5L20 7" />
      </svg>
    ),
  },
  already: {
    ringClass: "border-amber-500 dark:border-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/60",
    iconBgClass: "bg-amber-500",
    iconColorClass: "text-white",
    textColorClass: "text-amber-900 dark:text-amber-100",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  not_found: {
    ringClass: "border-red-400 dark:border-red-500",
    bgClass: "bg-red-50 dark:bg-red-950/60",
    iconBgClass: "bg-red-500",
    iconColorClass: "text-white",
    textColorClass: "text-red-900 dark:text-red-100",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    ),
  },
  inactive: {
    ringClass: "border-stone-400 dark:border-stone-500",
    bgClass: "bg-stone-50 dark:bg-stone-900",
    iconBgClass: "bg-stone-500",
    iconColorClass: "text-white",
    textColorClass: "text-stone-900 dark:text-stone-100",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <line x1="6" y1="12" x2="18" y2="12" />
      </svg>
    ),
  },
};

const MESSAGES: Record<FlashMode, (name?: string) => React.ReactNode> = {
  stamped: (name) => (
    <>
      Stamp collected: <strong>{name}</strong>
    </>
  ),
  already: (name) => (
    <>
      Already in your passport: <strong>{name}</strong>
    </>
  ),
  not_found: () => <>That QR didn&apos;t match any activity.</>,
  inactive: () => <>That activity has been deactivated.</>,
};

export function StampedFlash({
  mode,
  activityName,
}: {
  mode: FlashMode;
  activityName?: string;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;
  const tone = TONES[mode];

  return (
    <div className="pointer-events-none sticky top-14 z-20 mx-auto -mb-3 flex w-full max-w-md justify-center px-4">
      <div
        className={`pointer-events-auto flex w-full items-center gap-3 rounded-full border-2 ${tone.ringClass} ${tone.bgClass} ${tone.textColorClass} px-4 py-2 text-sm font-medium shadow-lg`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone.iconBgClass} ${tone.iconColorClass}`}
        >
          {tone.icon}
        </span>
        <span className="flex-1 truncate">
          {MESSAGES[mode](activityName)}
        </span>
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label="Dismiss"
          className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-full opacity-70 hover:bg-black/10 dark:hover:bg-white/10"
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
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type FlashMode = "stamped" | "already" | "not_found" | "inactive";

// Pass 04 / design-handoff §4.4.5 — palette overhaul.
// Audit insight: two ambers fighting on the same screen (success and
// duplicate). The "ritual" amber is now reserved for the success
// moment; duplicate falls back to neutral stone; not-found stays red;
// inactive (valid but off-hours) is amber-soft. Success-only gets the
// "Stamp another →" CTA + 10s auto-dismiss + tilted disc; the others
// persist until manual dismiss.

interface Tone {
  borderClass: string;
  bgClass: string;
  textClass: string;
  discClass: string;
  discIconColor: string;
  discRotate: string;
  shadowClass: string;
  icon: React.ReactNode;
}

const TONES: Record<FlashMode, Tone> = {
  stamped: {
    borderClass: "border-[1.5px] border-stamp-500",
    bgClass: "bg-white dark:bg-stone-900",
    textClass: "text-stone-900 dark:text-stone-100",
    discClass:
      "h-11 w-11 bg-white ring-[2.5px] ring-stamp-500 dark:bg-stone-900",
    discIconColor: "text-stamp-600 dark:text-stamp-500",
    discRotate: "rotate-[-8deg]",
    shadowClass: "shadow-[0_8px_24px_-12px_rgba(217,119,6,0.35)]",
    icon: <CheckIcon />,
  },
  already: {
    borderClass: "border border-stone-300 dark:border-stone-700",
    bgClass: "bg-white dark:bg-stone-900",
    textClass: "text-stone-900 dark:text-stone-100",
    discClass:
      "h-10 w-10 bg-stone-100 ring-[2px] ring-stone-300 dark:bg-stone-800 dark:ring-stone-600",
    discIconColor: "text-stone-600 dark:text-stone-300",
    discRotate: "",
    shadowClass: "shadow-sm",
    icon: <InfoIcon />,
  },
  not_found: {
    borderClass: "border border-red-300 dark:border-red-500/60",
    bgClass: "bg-red-50 dark:bg-red-950/40",
    textClass: "text-red-900 dark:text-red-100",
    discClass:
      "h-10 w-10 bg-white ring-[2px] ring-red-400 dark:bg-stone-900 dark:ring-red-500",
    discIconColor: "text-red-600 dark:text-red-400",
    discRotate: "",
    shadowClass: "shadow-sm",
    icon: <XIcon />,
  },
  inactive: {
    borderClass: "border border-amber-300 dark:border-amber-500/60",
    bgClass: "bg-amber-50 dark:bg-amber-950/40",
    textClass: "text-amber-900 dark:text-amber-100",
    discClass:
      "h-10 w-10 bg-white ring-[2px] ring-amber-400 dark:bg-stone-900 dark:ring-amber-500",
    discIconColor: "text-amber-600 dark:text-amber-400",
    discRotate: "",
    shadowClass: "shadow-sm",
    icon: <ClockIcon />,
  },
};

const EYEBROW: Record<FlashMode, string> = {
  stamped: "STAMP COLLECTED",
  already: "ALREADY COLLECTED",
  not_found: "NOT FOUND",
  inactive: "OFF-HOURS",
};

function bodyFor(mode: FlashMode, activityName?: string): React.ReactNode {
  switch (mode) {
    case "stamped":
      return activityName ? (
        <strong className="font-medium">{activityName}</strong>
      ) : (
        "New stamp in your passport."
      );
    case "already":
      return activityName ? (
        <>
          <strong className="font-medium">{activityName}</strong> is already in
          your passport.
        </>
      ) : (
        "Already in your passport."
      );
    case "not_found":
      return "That QR didn't match any activity.";
    case "inactive":
      return "That activity has been deactivated.";
  }
}

export function StampedFlash({
  mode,
  activityName,
}: {
  mode: FlashMode;
  activityName?: string;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (mode !== "stamped") return; // success-only auto-dismiss
    const t = setTimeout(() => setShow(false), 10000);
    return () => clearTimeout(t);
  }, [mode]);

  if (!show) return null;
  const tone = TONES[mode];
  const isSuccess = mode === "stamped";

  return (
    <div className="pointer-events-none sticky top-14 z-20 mx-auto -mb-3 flex w-full max-w-md justify-center px-4">
      <div
        className={`pointer-events-auto w-full rounded-2xl ${tone.borderClass} ${tone.bgClass} ${tone.textClass} ${tone.shadowClass} p-3`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex shrink-0 items-center justify-center rounded-full ${tone.discClass} ${tone.discRotate} ${tone.discIconColor}`}
            aria-hidden
          >
            {tone.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">
              {EYEBROW[mode]}
            </p>
            <p className="mt-0.5 truncate text-sm">{bodyFor(mode, activityName)}</p>
          </div>
          <button
            type="button"
            onClick={() => setShow(false)}
            aria-label="Dismiss"
            className="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-70 hover:bg-black/10 dark:hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>
        {isSuccess && (
          <Link
            href="/check-in"
            onClick={() => setShow(false)}
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-stamp-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stamp-500 active:bg-stamp-500"
          >
            Stamp another <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

function CloseIcon() {
  return (
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
  );
}

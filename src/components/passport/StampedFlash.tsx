"use client";

import { useEffect, useState } from "react";

export function StampedFlash({ activityName }: { activityName: string }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;
  return (
    <div className="pointer-events-none sticky top-14 z-20 mx-auto -mb-3 flex w-full max-w-md justify-center px-4">
      <div className="pointer-events-auto flex w-full items-center gap-3 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 shadow-lg dark:border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-100">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
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
        </span>
        <span className="flex-1 truncate">
          Stamp collected: <strong>{activityName}</strong>
        </span>
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label="Dismiss"
          className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-emerald-900/70 hover:bg-emerald-100 dark:text-emerald-100/70 dark:hover:bg-emerald-900"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

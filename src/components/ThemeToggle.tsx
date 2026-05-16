"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";

function readMode(): Mode {
  if (typeof window === "undefined") return "light";
  const v = window.localStorage.getItem("theme-mode");
  if (v === "light" || v === "dark") return v;
  // No stored choice yet → fall back to OS preference for the very first
  // paint, then persist the resolved value on first toggle.
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyMode(mode: Mode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

// Compact icon button in the header. Click toggles between light and
// dark. Removed the legacy "system" option: only two states now.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMode(readMode());
    setReady(true);
  }, []);

  function toggle() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    window.localStorage.setItem("theme-mode", next);
    applyMode(next);
    setMode(next);
  }

  const label = mode === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className={
        "inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 " +
        className
      }
    >
      {/* Neutral icon during SSR to avoid hydration mismatch; the real
          icon snaps in on the first client-effect render. */}
      {ready ? (mode === "dark" ? <MoonIcon /> : <SunIcon />) : <SunIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

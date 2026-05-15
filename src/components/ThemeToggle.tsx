"use client";

import { useEffect, useState } from "react";

type Mode = "system" | "light" | "dark";

function readMode(): Mode {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem("theme-mode");
  return v === "light" || v === "dark" ? v : "system";
}

function applyMode(mode: Mode) {
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const wantDark = mode === "dark" || (mode === "system" && sysDark);
  document.documentElement.classList.toggle("dark", wantDark);
}

function nextMode(m: Mode): Mode {
  if (m === "system") return "light";
  if (m === "light") return "dark";
  return "system";
}

// Compact icon button in the header. Click cycles system → light →
// dark → system. The current mode is reflected in the icon and the
// button's title for hover-readers. While in "system" mode the button
// also listens for OS theme changes and re-applies.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMode(readMode());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyMode("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, ready]);

  function cycle() {
    const next = nextMode(mode);
    if (next === "system") {
      window.localStorage.removeItem("theme-mode");
    } else {
      window.localStorage.setItem("theme-mode", next);
    }
    applyMode(next);
    setMode(next);
  }

  const label =
    mode === "system" ? "System theme" : mode === "light" ? "Light theme" : "Dark theme";

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Theme: ${mode}. Click to change.`}
      aria-label={label}
      className={
        "inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 " +
        className
      }
    >
      {/* Render a neutral icon during SSR to avoid a hydration mismatch;
          the real icon snaps in on the first client-effect render. */}
      {ready ? <ModeIcon mode={mode} /> : <ModeIcon mode="system" />}
    </button>
  );
}

function ModeIcon({ mode }: { mode: Mode }) {
  if (mode === "light") return <SunIcon />;
  if (mode === "dark") return <MoonIcon />;
  return <DesktopIcon />;
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
function DesktopIcon() {
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
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <line x1="8" y1="20" x2="16" y2="20" />
      <line x1="12" y1="16" x2="12" y2="20" />
    </svg>
  );
}

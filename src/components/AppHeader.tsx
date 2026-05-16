"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

// Hamburger left · centered title · theme + trailing slot right.
// Replaces the old inline segmented nav across user / kiosk / admin
// surfaces so the header stays compact on narrow viewports (Fold 7,
// older Androids, etc.) and gives the center bar room for the admin-
// configurable site title.

export interface AppNavItem {
  href: string;
  label: string;
  // Path prefix that should highlight this item. Defaults to href.
  // Use a more specific prefix (e.g. "/admin" vs "/admin/users") when
  // the natural startsWith would collide.
  matchPrefix?: string;
  // Set true on a single item per group whose match must be exact
  // (i.e. "/admin" should highlight only on /admin, not /admin/users).
  exact?: boolean;
}

export interface AppNavGroup {
  title?: string;
  items: AppNavItem[];
}

function isActiveFor(pathname: string | null, item: AppNavItem): boolean {
  if (!pathname) return false;
  const prefix = item.matchPrefix ?? item.href;
  if (item.exact) return pathname === prefix;
  if (pathname === prefix) return true;
  return pathname.startsWith(prefix + "/");
}

export function AppHeader({
  siteTitle,
  navGroups,
  homeHref = "/",
  trailing,
}: {
  siteTitle: string;
  navGroups: AppNavGroup[];
  homeHref?: string;
  trailing?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Auto-close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-paper/92 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-3 py-2 sm:px-4">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <HamburgerIcon />
          </button>
          <Link
            href={homeHref}
            className="min-w-0 flex-1 truncate text-center text-base font-semibold tracking-tight text-stone-900 hover:text-brand-700 dark:text-stone-100 dark:hover:text-brand-300"
          >
            {siteTitle}
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            {trailing}
          </div>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-stone-900/50"
            onClick={close}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-y-auto border-r border-stone-200 bg-white shadow-xl dark:border-stone-800 dark:bg-stone-900">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
              <span className="truncate font-mono text-xs uppercase tracking-[0.2em] text-brand-700 dark:text-brand-500">
                {siteTitle}
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="flex flex-1 flex-col p-2 text-base">
              {navGroups.map((group, gi) => (
                <div key={group.title ?? `g${gi}`} className={gi === 0 ? "" : "mt-2"}>
                  {group.title && (
                    <p className="px-3 pb-1 pt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">
                      {group.title}
                    </p>
                  )}
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const active = isActiveFor(pathname, item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={close}
                          className={
                            "flex min-h-12 items-center justify-between rounded-lg px-3 transition-colors " +
                            (active
                              ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                              : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800")
                          }
                        >
                          <span>{item.label}</span>
                          {active && (
                            <span
                              aria-hidden
                              className="ml-2 inline-block h-4 w-1 shrink-0 rounded-sm bg-brand-600 dark:bg-brand-500"
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function HamburgerIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/accolades", label: "Accolades" },
  { href: "/admin/kiosk-users", label: "Kiosk users" },
  { href: "/admin/access-codes", label: "Access codes" },
  { href: "/admin/dropdowns/departments", label: "Departments" },
  { href: "/admin/dropdowns/companies", label: "Companies" },
  { href: "/admin/dropdowns/regions", label: "Regions" },
  { href: "/admin/settings", label: "Settings" },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminShell({
  children,
  logoutForm,
}: {
  children: React.ReactNode;
  logoutForm: React.ReactNode;
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
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100 active:bg-stone-200 md:hidden dark:text-stone-300 dark:hover:bg-stone-800"
            >
              <HamburgerIcon />
            </button>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
              Stamprally · Admin
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {logoutForm}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-6 sm:px-6 sm:py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="flex flex-col gap-1 text-sm">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navItemClass(active)}
                >
                  <span>{item.label}</span>
                  {active && <BrandMarker />}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-stone-900/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] overflow-y-auto border-r border-stone-200 bg-white shadow-xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
                Stamprally · Admin
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-2 text-base">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={navItemClass(active, true)}
                  >
                    <span>{item.label}</span>
                    {active && <BrandMarker />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

function navItemClass(active: boolean, mobile = false): string {
  const base = mobile
    ? "relative flex min-h-12 items-center justify-between rounded-lg px-3 transition-colors"
    : "relative flex min-h-10 items-center justify-between rounded-lg px-3 py-2 transition-colors";
  if (active) {
    // Soft hairline ring + tiny lift to make the active item unmistakable
    // against the page surface. See design-handoff README §4.1.2.
    return (
      base +
      " bg-white font-medium text-stone-900 shadow-[0_0_0_1px_var(--color-rule),0_1px_2px_rgba(0,0,0,0.04)]" +
      " dark:bg-stone-800 dark:text-stone-50 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.4)]"
    );
  }
  return (
    base +
    " text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100"
  );
}

function BrandMarker() {
  return (
    <span
      aria-hidden
      className="ml-2 inline-block h-4 w-1 shrink-0 rounded-sm bg-brand-600 dark:bg-brand-500"
    />
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
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

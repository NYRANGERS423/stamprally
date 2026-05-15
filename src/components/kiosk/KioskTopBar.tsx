import Link from "next/link";
import { kioskLogoutAction } from "@/lib/actions/kiosk-auth";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/kiosk", label: "Events", match: "events" as const },
  {
    href: "/kiosk/give-accolade",
    label: "Accolades",
    match: "accolades" as const,
  },
];

export function KioskTopBar({
  username,
  active = null,
}: {
  username: string;
  active?: "events" | "accolades" | null;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-1 px-3 py-2.5 sm:gap-2 sm:px-6">
        <Link
          href="/kiosk"
          className="flex items-center gap-2 px-0.5 sm:px-1"
          aria-label="Kiosk home"
        >
          <span className="text-xl" aria-hidden>
            🏷️
          </span>
          <span className="hidden font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-700 sm:inline dark:text-brand-500">
            Stamprally · Kiosk
          </span>
          <span className="hidden text-xs text-stone-500 md:inline dark:text-stone-400">
            @{username}
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {NAV.map((item) => {
            const isActive = active === item.match;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "inline-flex h-10 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors sm:px-3 " +
                  (isActive
                    ? "bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100")
                }
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle className="ml-0.5 sm:ml-1" />
          <form action={kioskLogoutAction}>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md px-2 text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 sm:px-3 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              aria-label="Sign out"
              title="Sign out"
            >
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}

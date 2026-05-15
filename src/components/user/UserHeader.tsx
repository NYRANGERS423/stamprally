import Link from "next/link";
import { logoutAction } from "@/lib/actions/user-auth";

interface NavItem {
  href: string;
  label: string;
}

const DEFAULT_NAV: NavItem[] = [
  { href: "/passport", label: "Passport" },
  { href: "/events", label: "Events" },
  { href: "/check-in", label: "Stamp" },
];

export function UserHeader({
  active,
  nav = DEFAULT_NAV,
  showLogout = true,
}: {
  active?: "passport" | "events" | "stamp" | "edit" | null;
  nav?: NavItem[];
  showLogout?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
        <Link
          href="/passport"
          className="flex items-center gap-2 px-1"
          aria-label="Stamprally home"
        >
          <span className="text-xl" aria-hidden>
            🗽
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-700 dark:text-brand-500">
            Stamprally
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map((item) => {
            const isActive =
              ((active === "passport" || active === "edit") &&
                item.href === "/passport") ||
              (active === "events" && item.href === "/events") ||
              (active === "stamp" && item.href === "/check-in");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors " +
                  (isActive
                    ? "bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100")
                }
              >
                {item.label}
              </Link>
            );
          })}
          {showLogout && (
            <form action={logoutAction} className="ml-1">
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-100"
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
          )}
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";
import { logoutAction } from "@/lib/actions/user-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Segmented, type SegmentedItem } from "@/components/ui/Segmented";

type ActiveTab = "passport" | "events" | "stamp" | "leaderboard" | "edit" | null;

type NavValue = "passport" | "events" | "leaderboard" | "stamp";

interface NavItem {
  href: string;
  label: string;
  value: NavValue;
}

const DEFAULT_NAV: NavItem[] = [
  { href: "/passport", label: "Passport", value: "passport" },
  { href: "/events", label: "Events", value: "events" },
  { href: "/leaderboard", label: "Leaderboard", value: "leaderboard" },
  { href: "/check-in", label: "Stamp", value: "stamp" },
];

function activeValue(active: ActiveTab): NavValue | null {
  if (active === "passport" || active === "edit") return "passport";
  if (active === "events") return "events";
  if (active === "leaderboard") return "leaderboard";
  if (active === "stamp") return "stamp";
  return null;
}

export function UserHeader({
  active,
  nav = DEFAULT_NAV,
  showLogout = true,
}: {
  active?: ActiveTab;
  nav?: NavItem[];
  showLogout?: boolean;
}) {
  const segmentedItems: SegmentedItem<NavValue>[] = nav.map((item) => ({
    value: item.value,
    label: item.label,
    href: item.href,
  }));

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-paper/92 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6">
        <Link
          href="/passport"
          className="flex items-center gap-2 px-0.5 text-brand-700 sm:px-1 dark:text-brand-500"
          aria-label="Stamprally home"
        >
          <PassportMark />
          <span className="hidden font-mono text-[11px] font-semibold uppercase tracking-[0.25em] sm:inline">
            Stamprally
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Segmented<NavValue>
            items={segmentedItems}
            active={activeValue(active ?? null)}
            ariaLabel="Primary"
          />
          <ThemeToggle className="ml-0.5 sm:ml-1" />
          {showLogout && (
            <form action={logoutAction}>
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
          )}
        </div>
      </div>
    </header>
  );
}

function PassportMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="10.5" r="2.75" />
      <path d="M9 16.5h6" />
    </svg>
  );
}

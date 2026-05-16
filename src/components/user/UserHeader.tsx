import { logoutAction } from "@/lib/actions/user-auth";
import { getSiteTitle } from "@/lib/app-config";
import { AppHeader, type AppNavGroup } from "@/components/AppHeader";

const USER_NAV: AppNavGroup[] = [
  {
    items: [
      { href: "/passport", label: "Passport" },
      { href: "/events", label: "Events" },
      { href: "/leaderboard", label: "Rank" },
      { href: "/check-in", label: "Stamp" },
    ],
  },
];

// Server component — the `active` prop from earlier passes is gone;
// AppHeader resolves the active nav item from the URL itself.
export async function UserHeader({
  showLogout = true,
}: {
  showLogout?: boolean;
} = {}) {
  const siteTitle = (await getSiteTitle()) ?? "Stamprally";
  return (
    <AppHeader
      siteTitle={siteTitle}
      navGroups={USER_NAV}
      homeHref="/passport"
      trailing={showLogout ? <LogoutButton /> : null}
    />
  );
}

function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        aria-label="Sign out"
        title="Sign out"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
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
  );
}

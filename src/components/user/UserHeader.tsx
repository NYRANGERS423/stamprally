import { logoutAction } from "@/lib/actions/user-auth";
import { getSiteTitle } from "@/lib/app-config";
import { getUserSession } from "@/lib/auth/session";
import { getActiveStewardGrant } from "@/lib/auth/steward";
import { AppHeader, type AppNavGroup } from "@/components/AppHeader";

const BASE_NAV_ITEMS = [
  { href: "/passport", label: "Passport" },
  { href: "/events", label: "Events" },
  { href: "/leaderboard", label: "Rank" },
  { href: "/check-in", label: "Stamp" },
];

// Server component. The Steward entry only renders when the current
// session user has an active StewardGrant — so non-stewards never see
// the menu item even though the route exists site-wide.
export async function UserHeader({
  showLogout = true,
}: {
  showLogout?: boolean;
} = {}) {
  const [siteTitle, session] = await Promise.all([
    getSiteTitle(),
    getUserSession(),
  ]);
  const stewardGrant = session.userId
    ? await getActiveStewardGrant(session.userId)
    : null;

  const navItems = [...BASE_NAV_ITEMS];
  if (stewardGrant) {
    navItems.push({ href: "/steward", label: "Steward" });
  }
  const nav: AppNavGroup[] = [{ items: navItems }];

  return (
    <AppHeader
      siteTitle={siteTitle ?? "Stamprally"}
      navGroups={nav}
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

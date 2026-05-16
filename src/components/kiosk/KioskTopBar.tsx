import { kioskLogoutAction } from "@/lib/actions/kiosk-auth";
import { getSiteTitle } from "@/lib/app-config";
import { AppHeader, type AppNavGroup } from "@/components/AppHeader";

const KIOSK_NAV: AppNavGroup[] = [
  {
    items: [
      { href: "/kiosk", label: "Events", exact: true },
      { href: "/kiosk/give-accolade", label: "Accolades" },
    ],
  },
];

export async function KioskTopBar({ username }: { username: string }) {
  const siteTitle = (await getSiteTitle()) ?? "Stamprally";
  return (
    <AppHeader
      siteTitle={`${siteTitle} · Kiosk @${username}`}
      navGroups={KIOSK_NAV}
      homeHref="/kiosk"
      trailing={<LogoutButton />}
    />
  );
}

function LogoutButton() {
  return (
    <form action={kioskLogoutAction}>
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

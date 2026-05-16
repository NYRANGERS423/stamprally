import { getSiteTitle } from "@/lib/app-config";
import { AppHeader, type AppNavGroup } from "@/components/AppHeader";

// Pass 05 / fix-list 2026-05-16:
// AdminShell is now a thin async wrapper around <AppHeader>. The
// sidebar + custom mobile drawer are gone — navigation lives entirely
// inside the AppHeader hamburger so the layout matches the user-facing
// surfaces (one consistent header pattern site-wide).
const ADMIN_NAV: AppNavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", exact: true }],
  },
  {
    title: "People",
    items: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/kiosk-users", label: "Kiosk users" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/events", label: "Events" },
      { href: "/admin/accolades", label: "Accolades" },
    ],
  },
  {
    title: "Configuration",
    items: [
      { href: "/admin/access-codes", label: "Access codes" },
      { href: "/admin/dropdowns/departments", label: "Departments" },
      { href: "/admin/dropdowns/companies", label: "Companies" },
      { href: "/admin/dropdowns/regions", label: "Regions" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

export async function AdminShell({
  children,
  logoutForm,
}: {
  children: React.ReactNode;
  logoutForm: React.ReactNode;
}) {
  const siteTitle = (await getSiteTitle()) ?? "Stamprally";
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        siteTitle={`${siteTitle} · Admin`}
        navGroups={ADMIN_NAV}
        homeHref="/admin"
        trailing={logoutForm}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

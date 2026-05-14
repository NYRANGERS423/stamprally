import { getAdminSession } from "@/lib/auth/session";
import { adminLogoutAction } from "@/lib/actions/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();
  // The login page is also under /admin/* — skip the chrome if not signed in.
  if (!session.isAdmin) {
    return <>{children}</>;
  }

  return (
    <AdminShell
      logoutForm={
        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Sign out
          </button>
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}

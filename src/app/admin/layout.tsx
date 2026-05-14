import { getAdminSession } from "@/lib/auth/session";
import { adminLogoutAction } from "@/lib/actions/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();
  // The login page is also under /admin/* — skip the chrome if not signed in.
  if (!session.isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
            Stamprally · Admin
          </span>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-6 py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <AdminNav />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getKioskSession } from "@/lib/auth/session";
import { KioskLoginForm } from "@/components/kiosk/KioskLoginForm";

export default async function KioskLoginPage() {
  const session = await getKioskSession();
  if (session.kioskUserId) {
    redirect("/kiosk");
  }
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
            Stamprally · Kiosk
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Kiosk sign-in
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Shared event-day station. Multiple devices can be signed in at the
            same time.
          </p>
        </div>
        <KioskLoginForm />
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-stone-600 hover:bg-stone-100 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

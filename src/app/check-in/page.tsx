import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";
import { CodeEntryForm } from "@/components/check-in/CodeEntryForm";

export default async function CheckInLanding() {
  const session = await getUserSession();
  if (!session.userId) redirect("/login?next=/check-in");
  if (session.mustChangePassword) redirect("/force-change-password");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
            Stamprally
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Stamp a new place
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Point your phone&apos;s camera at the kiosk QR code — or type the
            code shown beneath it.
          </p>
        </div>
        <CodeEntryForm />
        <div className="flex justify-center">
          <Link
            href="/passport"
            className="inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-stone-600 hover:bg-stone-100 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            ← Back to my passport
          </Link>
        </div>
      </div>
    </main>
  );
}

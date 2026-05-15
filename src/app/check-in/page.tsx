import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";
import { CodeEntryForm } from "@/components/check-in/CodeEntryForm";
import { CameraScanner } from "@/components/check-in/CameraScanner";
import { UserHeader } from "@/components/user/UserHeader";

export default async function CheckInLanding() {
  const session = await getUserSession();
  if (!session.userId) redirect("/login?next=/check-in");
  if (session.mustChangePassword) redirect("/force-change-password");

  return (
    <>
      <UserHeader active="stamp" />
      <main className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 dark:border-stone-800 dark:bg-stone-900">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Stamp a new place
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Tap &ldquo;Open camera&rdquo; and scan the kiosk QR — or type the
              4-digit code shown beneath it.
            </p>
          </div>

          <CameraScanner />

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
            <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
              or
            </span>
            <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          </div>

          <CodeEntryForm />
        </div>
      </main>
    </>
  );
}

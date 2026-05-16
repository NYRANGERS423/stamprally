import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";
import { CodeEntryForm } from "@/components/check-in/CodeEntryForm";
import { CameraScanner } from "@/components/check-in/CameraScanner";
import { CheckInContext } from "@/components/check-in/CheckInContext";
import { UserHeader } from "@/components/user/UserHeader";

export default async function CheckInLanding() {
  const session = await getUserSession();
  if (!session.userId) redirect("/login?next=/check-in");
  if (session.mustChangePassword) redirect("/force-change-password");

  return (
    <>
      <UserHeader />
      <main className="flex flex-1 flex-col items-start justify-start px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-sm space-y-4">
          {/* Context strip — only renders when an event is live today. */}
          <CheckInContext />

          <header>
            <h1 className="text-2xl font-semibold tracking-tight">
              Stamp a new place
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Open the camera and scan the activity QR an event helper is
              showing. Or type the 4-digit code shown beneath it.
            </p>
          </header>

          {/* Camera card — primary path, brand-tinted */}
          <section className="overflow-hidden rounded-2xl border border-brand-200 bg-brand-50/40 p-5 dark:border-brand-900/60 dark:bg-brand-900/20">
            <CameraScanner />
          </section>

          {/* Code card — secondary path */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
              Or enter the code
            </p>
            <CodeEntryForm />
          </section>
        </div>
      </main>
    </>
  );
}

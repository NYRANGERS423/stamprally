import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export default async function ForceChangePasswordPage() {
  const session = await getUserSession();
  if (!session.userId) {
    redirect("/login");
  }
  // If the flag isn't set, the user shouldn't be here — send them to their
  // passport.
  if (!session.mustChangePassword) {
    redirect("/passport");
  }
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-amber-300 bg-amber-50 p-8 dark:border-amber-800 dark:bg-amber-950/30">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">
            Password reset required
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-amber-900 dark:text-amber-100">
            Set a new password
          </h1>
          <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
            An administrator reset your password. Choose a new one to continue.
          </p>
        </div>
        <ChangePasswordForm />
      </div>
    </main>
  );
}

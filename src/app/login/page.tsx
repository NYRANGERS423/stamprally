import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await getUserSession();
  if (session.userId) {
    redirect(session.mustChangePassword ? "/force-change-password" : "/passport");
  }
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
            Stamprally
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Sign in
          </h1>
        </div>
        <LoginForm />
        <div className="text-center text-sm text-stone-600 dark:text-stone-400">
          Don&apos;t have a passport yet?{" "}
          <Link
            href="/signup"
            className="font-medium text-brand-700 hover:underline dark:text-brand-500"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}

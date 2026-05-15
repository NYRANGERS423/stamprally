import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { SignupForm } from "@/components/auth/SignupForm";
import { AuthChooserFooter } from "@/components/auth/AuthChooserFooter";

export default async function SignupPage() {
  const session = await getUserSession();
  if (session.userId) {
    redirect(session.mustChangePassword ? "/force-change-password" : "/passport");
  }

  const [departments, companies, regions] = await Promise.all([
    db.department.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.company.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.region.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const setupIncomplete =
    departments.length === 0 ||
    companies.length === 0 ||
    regions.length === 0;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
            Stamprally
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Create your passport
          </h1>
        </div>

        {setupIncomplete ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <p className="font-medium">Signups aren&apos;t open yet</p>
            <p className="mt-1">
              An administrator still needs to configure departments, companies,
              and regions. Please check back shortly.
            </p>
          </div>
        ) : (
          <SignupForm
            departments={departments}
            companies={companies}
            regions={regions}
          />
        )}

        <div className="text-center text-sm text-stone-600 dark:text-stone-400">
          Already have one?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-700 hover:underline dark:text-brand-500"
          >
            Sign in
          </Link>
        </div>
        <AuthChooserFooter current="user" />
      </div>
    </main>
  );
}

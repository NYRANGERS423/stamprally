import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";
import { logoutAction } from "@/lib/actions/user-auth";

export default async function PassportPage() {
  const session = await getUserSession();
  if (!session.userId) {
    redirect("/login");
  }
  if (session.mustChangePassword) {
    redirect("/force-change-password");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { department: true, company: true, region: true },
  });
  if (!user) {
    redirect("/login");
  }

  const startedOn = user.startDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-700 dark:text-brand-500">
            Stamprally
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-brand-700 bg-gradient-to-br from-brand-50 to-brand-100 shadow-lg dark:border-brand-500 dark:from-brand-900/40 dark:to-brand-900/10">
          <div className="border-b-2 border-dashed border-brand-700/60 px-6 py-3 dark:border-brand-500/60">
            <p className="text-center font-mono text-xs uppercase tracking-[0.4em] text-brand-900 dark:text-brand-300">
              Passport · Stamprally
            </p>
          </div>
          <div className="space-y-4 p-6">
            <Row label="Surname / Name">
              <span className="text-lg font-semibold uppercase tracking-wide">
                {user.lastName}
                <br />
                <span className="font-normal">{user.firstName}</span>
              </span>
            </Row>
            <div className="grid grid-cols-2 gap-4">
              <Row label="Passport number">
                <span className="font-mono text-sm">
                  {user.passportNumber}
                </span>
              </Row>
              <Row label="Citizen since">{startedOn}</Row>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Row label="Nationality">{user.department?.name ?? "—"}</Row>
              <Row label="Place of issue">{user.region?.name ?? "—"}</Row>
            </div>
            <Row label="Issuing authority">{user.company?.name ?? "—"}</Row>
            {user.occupation && (
              <Row label="Occupation">{user.occupation}</Row>
            )}
          </div>
          <div className="border-t-2 border-dashed border-brand-700/60 bg-brand-50/60 px-6 py-3 dark:border-brand-500/60 dark:bg-brand-900/20">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-brand-900/70 dark:text-brand-300/70">
              No stamps yet — events coming soon
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-500 dark:text-stone-400">
          Phase 2: photo, signature, tags & check-in. Phase 3: events &
          activities. Phase 4: leaderboards & accolades.
        </p>
      </div>
    </main>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-900/60 dark:text-brand-300/70">
        {label}
      </p>
      <div className="text-stone-900 dark:text-stone-100">{children}</div>
    </div>
  );
}

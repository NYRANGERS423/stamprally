import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";
import { logoutAction } from "@/lib/actions/user-auth";
import { displayTagLabel } from "@/lib/passport-tags";

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
    include: {
      department: true,
      company: true,
      region: true,
      tags: { orderBy: { key: "asc" } },
    },
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
              className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
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
          <div className="p-6">
            <div className="flex gap-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md border-2 border-brand-700/40 bg-white dark:border-brand-500/40 dark:bg-stone-900">
                {user.photoPath ? (
                  <Image
                    src={`/api/uploads/${user.photoPath}`}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                    No photo
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-900/60 dark:text-brand-300/70">
                    Surname / Name
                  </p>
                  <p className="text-lg font-semibold uppercase leading-tight tracking-wide">
                    {user.lastName}
                  </p>
                  <p className="text-base leading-tight">{user.firstName}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
              <Row label="Passport number">
                <span className="font-mono text-sm">
                  {user.passportNumber}
                </span>
              </Row>
              <Row label="Citizen since">{startedOn}</Row>
              <Row label="Nationality">{user.department?.name ?? "—"}</Row>
              <Row label="Place of issue">{user.region?.name ?? "—"}</Row>
              <div className="col-span-2">
                <Row label="Issuing authority">
                  {user.company?.name ?? "—"}
                </Row>
              </div>
              {user.occupation && (
                <div className="col-span-2">
                  <Row label="Occupation">{user.occupation}</Row>
                </div>
              )}
            </div>

            {user.tags.length > 0 && (
              <div className="mt-5 border-t border-dashed border-brand-700/30 pt-4 dark:border-brand-500/30">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-900/60 dark:text-brand-300/70">
                  About me
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {user.tags.map((tag) => (
                    <li
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-700/10 px-2.5 py-1 text-xs text-brand-900 dark:bg-brand-500/15 dark:text-brand-200"
                    >
                      <span className="text-brand-900/60 dark:text-brand-200/70">
                        {displayTagLabel(tag.key)}:
                      </span>
                      <span className="font-medium">{tag.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="border-t-2 border-dashed border-brand-700/60 bg-brand-50/60 px-6 py-3 dark:border-brand-500/60 dark:bg-brand-900/20">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-brand-900/70 dark:text-brand-300/70">
              No stamps yet — events coming soon
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3 text-sm">
          <Link
            href="/passport/edit"
            className="inline-flex h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-6 font-medium text-stone-900 shadow-sm transition-colors hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
          >
            Edit passport
          </Link>
        </div>
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

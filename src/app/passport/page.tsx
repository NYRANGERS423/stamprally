import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";
import { displayTagLabel } from "@/lib/passport-tags";
import { parseSignature } from "@/lib/signature";
import { SignatureRender } from "@/components/passport/SignatureRender";
import { StampedFlash } from "@/components/passport/StampedFlash";
import { UserHeader } from "@/components/user/UserHeader";
import { getTheme } from "@/lib/themes";
import {
  accoladeChips,
  computeAutoAccolades,
  computePersonalStats,
  loadManualAccolades,
} from "@/lib/passport-stats";

export default async function PassportPage({
  searchParams,
}: {
  searchParams: Promise<{ stamped?: string }>;
}) {
  const { stamped } = await searchParams;
  const session = await getUserSession();
  if (!session.userId) {
    redirect("/login");
  }
  if (session.mustChangePassword) {
    redirect("/force-change-password");
  }

  const [user, stamps, stats, autoAccolades, manualAccolades] = await Promise.all([
    db.user.findUnique({
      where: { id: session.userId },
      include: {
        department: true,
        company: true,
        region: true,
        tags: { orderBy: { key: "asc" } },
      },
    }),
    db.stamp.findMany({
      where: { userId: session.userId },
      orderBy: { stampedAt: "desc" },
      include: {
        activity: {
          select: {
            id: true,
            name: true,
            event: { select: { id: true, name: true } },
          },
        },
      },
    }),
    computePersonalStats(session.userId),
    computeAutoAccolades(session.userId),
    loadManualAccolades(session.userId),
  ]);
  const accolades = accoladeChips(autoAccolades);
  const totalAccolades = accolades.length + manualAccolades.length;
  if (!user) {
    redirect("/login");
  }

  const stampsByEvent = new Map<
    string,
    { eventName: string; stamps: typeof stamps }
  >();
  for (const s of stamps) {
    const eId = s.activity.event.id;
    const eName = s.activity.event.name;
    if (!stampsByEvent.has(eId)) {
      stampsByEvent.set(eId, { eventName: eName, stamps: [] });
    }
    stampsByEvent.get(eId)!.stamps.push(s);
  }
  const eventGroups = Array.from(stampsByEvent.entries());

  const startedOn = user.startDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const signature = parseSignature(user.signatureSvg);
  const theme = getTheme(user.theme);

  return (
    <>
      <UserHeader active="passport" />
      {stamped && <StampedFlash activityName={stamped} />}
      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-md">
        <div className={"overflow-hidden rounded-2xl " + theme.cardClass}>
          <div className={theme.headerStripClass}>
            <p className={theme.headerTextClass}>
              {theme.emoji} Passport · Stamprally
            </p>
          </div>
          <div className="p-6">
            <div className="flex gap-4">
              <div className={"relative h-28 w-28 shrink-0 overflow-hidden rounded-md " + theme.photoBorderClass}>
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
                  <p className={theme.labelClass}>
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
              <Row label="Passport number" labelClass={theme.labelClass}>
                <span className="font-mono text-sm">
                  {user.passportNumber}
                </span>
              </Row>
              <Row label="Citizen since" labelClass={theme.labelClass}>{startedOn}</Row>
              <Row label="Nationality" labelClass={theme.labelClass}>{user.department?.name ?? "—"}</Row>
              <Row label="Place of issue" labelClass={theme.labelClass}>{user.region?.name ?? "—"}</Row>
              <div className="col-span-2">
                <Row label="Issuing authority" labelClass={theme.labelClass}>
                  {user.company?.name ?? "—"}
                </Row>
              </div>
              {user.occupation && (
                <div className="col-span-2">
                  <Row label="Occupation" labelClass={theme.labelClass}>{user.occupation}</Row>
                </div>
              )}
            </div>

            {user.tags.length > 0 && (
              <div className="mt-5 border-t border-dashed border-brand-700/30 pt-4 dark:border-brand-500/30">
                <p className={theme.labelClass}>
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

            {signature && (
              <div className="mt-5 border-t border-dashed border-brand-700/30 pt-3 dark:border-brand-500/30">
                <p className={theme.labelClass}>
                  Signature
                </p>
                <SignatureRender
                  data={signature}
                  className="mt-1 block h-14 w-full text-brand-900 dark:text-brand-200"
                />
              </div>
            )}
          </div>
          <div className={theme.footerStripClass}>
            <p className={theme.footerTextClass}>
              Stamps on next page
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/check-in"
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold shadow-md transition-colors ${theme.ctaClass}`}
          >
            <StampNewIcon />
            Stamp new place
          </Link>
        </div>

        <section className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="Stamps" value={stats.totalStamps} />
          <Stat label="Events" value={stats.eventsParticipated} />
          <Stat label="Accolades" value={totalAccolades} />
        </section>

        {totalAccolades > 0 && (
          <section className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
            <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-800">
              <h2 className="text-sm font-medium">Accolades</h2>
            </div>
            <ul className="flex flex-wrap gap-2 p-4">
              {manualAccolades.map((a) => (
                <li
                  key={a.id}
                  title={a.description ?? undefined}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stamp-600 bg-stamp-50 px-3 py-1.5 text-xs font-semibold text-stamp-700 dark:border-stamp-500 dark:bg-stamp-600/20 dark:text-stamp-300"
                >
                  {a.emoji && <span>{a.emoji}</span>}
                  {a.label}
                </li>
              ))}
              {accolades.map((a, i) => (
                <li
                  key={`${a.kind}-${i}`}
                  title={a.description}
                  className="inline-flex items-center gap-1.5 rounded-full bg-stamp-600/10 px-3 py-1.5 text-xs font-medium text-stamp-700 dark:bg-stamp-600/20 dark:text-stamp-500"
                >
                  <StarIcon />
                  {a.label}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={`mt-6 overflow-hidden rounded-2xl ${theme.stampsCardClass}`}>
          <div className={theme.stampsHeaderClass}>
            <p className={theme.stampsHeaderTextClass}>
              Stamps · {stamps.length}
            </p>
          </div>
          <div className="space-y-5 p-5">
            {eventGroups.length === 0 ? (
              <p className="py-4 text-center text-sm text-stone-600 dark:text-stone-400">
                No stamps yet. Tap &ldquo;Stamp new place&rdquo; at any event
                to collect your first.
              </p>
            ) : (
              eventGroups.map(([eId, group]) => (
                <div key={eId}>
                  <h3 className={theme.labelClass}>
                    {group.eventName}
                  </h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {group.stamps.map((s) => (
                      <li
                        key={s.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${theme.stampChipClass}`}
                      >
                        <StampBadgeIcon />
                        <span className={`font-semibold ${theme.stampChipTextClass}`}>
                          {s.activity.name}
                        </span>
                        <span className="text-stone-500 dark:text-stone-400">
                          {s.stampedAt.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          <Link
            href="/passport/edit"
            className="inline-flex h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-6 font-medium text-stone-900 shadow-sm transition-colors hover:bg-stone-100 active:bg-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
          >
            Edit passport
          </Link>
        </div>
        </div>
      </main>
    </>
  );
}

function Row({
  label,
  children,
  labelClass,
}: {
  label: string;
  children: React.ReactNode;
  labelClass?: string;
}) {
  return (
    <div>
      <p
        className={
          labelClass ??
          "font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400"
        }
      >
        {label}
      </p>
      <div className="text-stone-900 dark:text-stone-100">{children}</div>
    </div>
  );
}

function StampNewIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
      <path d="M7 7h10l1 4H6z" />
      <path d="M5 13h14v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function StampBadgeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-stamp-600"
      aria-hidden="true"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2l2.39 6.95H22l-5.8 4.21L18.45 21 12 16.78 5.55 21l2.25-7.84L2 8.95h7.61L12 2z" />
    </svg>
  );
}

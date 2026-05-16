import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";
import { parseSignature } from "@/lib/signature";
import { MyIdSheet } from "@/components/passport/MyIdSheet";
import { PassportSurfaces } from "@/components/passport/PassportSurfaces";
import { StampedFlash } from "@/components/passport/StampedFlash";
import { StatsStrip } from "@/components/passport/StatsStrip";
import { UserHeader } from "@/components/user/UserHeader";
import { getTheme } from "@/lib/themes";
import {
  computePersonalStats,
  loadManualAccolades,
} from "@/lib/passport-stats";

export default async function PassportPage({
  searchParams,
}: {
  searchParams: Promise<{
    stamped?: string;
    already?: string;
    stampError?: string;
  }>;
}) {
  const { stamped, already, stampError } = await searchParams;
  const flashName = stamped ?? already;
  const flashMode: import("@/components/passport/StampedFlash").FlashMode | null =
    stamped
      ? "stamped"
      : already
        ? "already"
        : stampError === "not_found"
          ? "not_found"
          : stampError === "inactive"
            ? "inactive"
            : null;
  const session = await getUserSession();
  if (!session.userId) {
    redirect("/login");
  }
  if (session.mustChangePassword) {
    redirect("/force-change-password");
  }

  const [user, stamps, stats, manualAccolades] = await Promise.all([
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
    loadManualAccolades(session.userId),
  ]);
  const totalAccolades = manualAccolades.length;
  if (!user) {
    redirect("/login");
  }

  const stampsByEvent = new Map<
    string,
    { eventId: string; eventName: string; stamps: typeof stamps }
  >();
  for (const s of stamps) {
    const eId = s.activity.event.id;
    const eName = s.activity.event.name;
    if (!stampsByEvent.has(eId)) {
      stampsByEvent.set(eId, { eventId: eId, eventName: eName, stamps: [] });
    }
    stampsByEvent.get(eId)!.stamps.push(s);
  }
  const eventGroups = Array.from(stampsByEvent.values());

  const startedOn = user.startDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const signature = parseSignature(user.signatureSvg);
  const theme = getTheme(user.theme);

  return (
    <>
      <UserHeader />
      {flashMode && (
        <StampedFlash mode={flashMode} activityName={flashName} />
      )}
      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-md">
          <PassportSurfaces
            user={user}
            manualAccolades={manualAccolades}
            eventGroups={eventGroups}
            startedOn={startedOn}
            signature={signature}
            theme={theme}
            editHref="/passport/edit"
            accoladesHeaderExtras={
              <MyIdSheet
                userId={user.id}
                name={`${user.firstName} ${user.lastName}`}
              />
            }
            newlyStampedActivityName={stamped ?? null}
          />

          <StatsStrip
            stamps={stats.totalStamps}
            events={stats.eventsParticipated}
            accolades={totalAccolades}
          />

          {stamps.length === 0 && (
            <div className="mt-4 flex justify-center">
              <Link
                href="/check-in"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-stamp-500/30 bg-stamp-50 px-4 text-sm font-medium text-stamp-700 transition-colors hover:bg-stamp-100 dark:border-stamp-500/40 dark:bg-stamp-500/10 dark:text-stamp-500"
              >
                <span aria-hidden>📍</span>
                Stamp at an event
                <span aria-hidden>→</span>
              </Link>
            </div>
          )}

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

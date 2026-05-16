import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserSession } from "@/lib/auth/session";
import { parseSignature } from "@/lib/signature";
import { PassportSurfaces } from "@/components/passport/PassportSurfaces";
import { StatsStrip } from "@/components/passport/StatsStrip";
import { PageFlipper, clampPage } from "@/components/ui/PageFlipper";
import { UserHeader } from "@/components/user/UserHeader";
import { getTheme } from "@/lib/themes";
import {
  computePersonalStats,
  loadManualAccolades,
} from "@/lib/passport-stats";

const STAMPS_PER_PAGE = 6;

// Pass 03 / design-handoff §4.3.1 — read-only passport view that the
// leaderboard rows link to. Any signed-in user can view any other
// signed-in user's passport ("Browse should beget browsing"). No edit
// affordance and no MyIdSheet — just a back-pill to the leaderboard.
export default async function UserPassportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stampPage?: string }>;
}) {
  const { id } = await params;
  const { stampPage } = await searchParams;
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  if (session.mustChangePassword) redirect("/force-change-password");

  if (id === session.userId) {
    redirect("/passport");
  }

  const [user, stamps, stats, manualAccolades] = await Promise.all([
    db.user.findUnique({
      where: { id },
      include: {
        department: true,
        company: true,
        region: true,
        tags: { orderBy: { key: "asc" } },
      },
    }),
    db.stamp.findMany({
      where: { userId: id },
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
    computePersonalStats(id),
    loadManualAccolades(id),
  ]);
  if (!user) notFound();

  const totalAccolades = manualAccolades.length;

  // Stamps pagination: same shape as /passport.
  const totalPages = Math.max(1, Math.ceil(stamps.length / STAMPS_PER_PAGE));
  const currentPage = clampPage(stampPage, totalPages);
  const pageStart = (currentPage - 1) * STAMPS_PER_PAGE;
  const pageStamps = stamps.slice(pageStart, pageStart + STAMPS_PER_PAGE);

  const stampsByEvent = new Map<
    string,
    { eventId: string; eventName: string; stamps: typeof stamps }
  >();
  for (const s of pageStamps) {
    const eId = s.activity.event.id;
    if (!stampsByEvent.has(eId)) {
      stampsByEvent.set(eId, {
        eventId: eId,
        eventName: s.activity.event.name,
        stamps: [],
      });
    }
    stampsByEvent.get(eId)!.stamps.push(s);
  }
  const eventGroups = Array.from(stampsByEvent.values());

  function stampPageHref(p: number): string {
    return p === 1 ? `/u/${id}` : `/u/${id}?stampPage=${p}`;
  }

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
      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <Link
              href="/leaderboard"
              className="inline-flex h-9 items-center gap-1 rounded-full border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              <span aria-hidden>←</span> Leaderboard
            </Link>
          </div>

          <PassportSurfaces
            user={user}
            manualAccolades={manualAccolades}
            eventGroups={eventGroups}
            startedOn={startedOn}
            signature={signature}
            theme={theme}
            editHref={null}
            totalStampsOverride={stamps.length}
            stampsFooter={
              <PageFlipper
                current={currentPage}
                total={totalPages}
                buildHref={stampPageHref}
                label="Stamps pages"
                scrollAnchor="stamps"
              />
            }
          />

          <StatsStrip
            stamps={stats.totalStamps}
            events={stats.eventsParticipated}
            accolades={totalAccolades}
          />
        </div>
      </main>
    </>
  );
}

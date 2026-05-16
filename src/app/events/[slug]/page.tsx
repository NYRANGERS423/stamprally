import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { UserHeader } from "@/components/user/UserHeader";
import { RankRow } from "@/components/leaderboard/RankRow";
import { fetchLeaderboard } from "@/lib/leaderboard";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { userId } = await requireUser();
  const { slug } = await params;

  const event = await db.event.findUnique({
    where: { slug },
    include: {
      activities: {
        where: { active: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true },
      },
    },
  });
  if (!event || !event.active) notFound();

  const allActivityIds = event.activities.map((a) => a.id);

  const [myStamps, eventLeaderboard] = await Promise.all([
    db.stamp.findMany({
      where: { userId, activityId: { in: allActivityIds } },
      select: { activityId: true },
    }),
    // Mini-leaderboard: top 5 by overall event points (stamp points +
    // accolade points scoped to this event). Same ranking shape as the
    // global /rank page (per fix-list 2026-05-16).
    fetchLeaderboard({ eventId: event.id, board: "points", limit: 5 }),
  ]);
  const myStampedActivityIds = new Set(myStamps.map((s) => s.activityId));
  const totalActive = allActivityIds.length;
  const myStampedCount = myStampedActivityIds.size;

  return (
    <>
      <UserHeader active="events" />
      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full max-w-3xl space-y-6">
        <div>
          <Link
            href="/events"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 active:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            All events
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            {event.name}
          </h1>
          {event.description && (
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {event.description}
            </p>
          )}
        </div>

        <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium">Your progress</h2>
            <span className="font-mono text-sm">
              {myStampedCount} / {totalActive}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div
              className="h-full rounded-full bg-stamp-600 transition-all"
              style={{
                width:
                  totalActive > 0
                    ? `${(myStampedCount / totalActive) * 100}%`
                    : "0%",
              }}
            />
          </div>
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {event.activities.map((a) => {
              const done = myStampedActivityIds.has(a.id);
              return (
                <li
                  key={a.id}
                  className={
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs " +
                    (done
                      ? "border-stamp-600 bg-stamp-50 text-stamp-700 dark:border-stamp-500 dark:bg-stamp-600/20 dark:text-stamp-500"
                      : "border-stone-300 text-stone-500 dark:border-stone-700 dark:text-stone-400")
                  }
                >
                  {done ? <CheckDot /> : <EmptyDot />}
                  {a.name}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
            <h2 className="text-sm font-medium">Rank</h2>
            <Link
              href={`/leaderboard?event=${event.id}`}
              className="text-xs text-stone-500 hover:text-stone-700 hover:underline dark:text-stone-400 dark:hover:text-stone-200"
            >
              All ranks →
            </Link>
          </div>
          {eventLeaderboard.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-stone-500 dark:text-stone-400">
              No stamps yet — be the first!
            </p>
          ) : (
            <ol className="flex flex-col gap-1 p-2">
              {eventLeaderboard.map((row, i) => (
                <RankRow
                  key={row.userId}
                  rank={i + 1}
                  row={row}
                  board="points"
                  isMe={row.userId === userId}
                />
              ))}
            </ol>
          )}
        </section>
        </div>
      </main>
    </>
  );
}

function CheckDot() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function EmptyDot() {
  return (
    <span className="inline-block h-2 w-2 rounded-full border border-current" />
  );
}

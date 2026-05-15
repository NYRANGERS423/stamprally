import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { UserHeader } from "@/components/user/UserHeader";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  photoPath: string | null;
  stamps: number;
}

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

  const [myStamps, leaderboardRaw] = await Promise.all([
    db.stamp.findMany({
      where: { userId, activityId: { in: allActivityIds } },
      select: { activityId: true },
    }),
    db.stamp.groupBy({
      by: ["userId"],
      where: { activityId: { in: allActivityIds } },
      _count: { _all: true },
      orderBy: { _count: { userId: "desc" } },
      take: 50,
    }),
  ]);
  const myStampedActivityIds = new Set(myStamps.map((s) => s.activityId));

  const leaderboardUserIds = leaderboardRaw.map((r) => r.userId);
  const leaderboardUsers = leaderboardUserIds.length
    ? await db.user.findMany({
        where: { id: { in: leaderboardUserIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          photoPath: true,
        },
      })
    : [];
  const userById = new Map(leaderboardUsers.map((u) => [u.id, u]));

  const leaderboard: LeaderboardEntry[] = leaderboardRaw
    .map((r, i) => {
      const u = userById.get(r.userId);
      if (!u) return null;
      return {
        rank: i + 1,
        userId: r.userId,
        firstName: u.firstName,
        lastName: u.lastName,
        photoPath: u.photoPath,
        stamps: r._count._all,
      };
    })
    .filter((x): x is LeaderboardEntry => x !== null);

  const myEntry = leaderboard.find((e) => e.userId === userId) ?? null;
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
            className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-stone-600 hover:bg-stone-100 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            ← All events
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
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

        <section className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
            <h2 className="text-sm font-medium">Leaderboard</h2>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Top {leaderboard.length}
            </span>
          </div>
          {leaderboard.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-stone-500 dark:text-stone-400">
              No stamps yet — be the first!
            </p>
          ) : (
            <ol className="divide-y divide-stone-200 dark:divide-stone-800">
              {leaderboard.map((entry) => {
                const isMe = entry.userId === userId;
                return (
                  <li
                    key={entry.userId}
                    className={
                      "flex items-center gap-3 px-4 py-3 " +
                      (isMe ? "bg-brand-50 dark:bg-brand-900/20" : "")
                    }
                  >
                    <span className="w-7 shrink-0 font-mono text-sm text-stone-500 dark:text-stone-400">
                      {entry.rank}
                    </span>
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                      {entry.photoPath ? (
                        <Image
                          src={`/api/uploads/${entry.photoPath}`}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                          {entry.firstName[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {entry.firstName} {entry.lastName}
                        {isMe && (
                          <span className="ml-1.5 text-xs font-normal text-brand-700 dark:text-brand-400">
                            you
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold">
                      {entry.stamps}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {myEntry && myEntry.rank > 10 && (
          <p className="text-center text-xs text-stone-500 dark:text-stone-400">
            You&apos;re #{myEntry.rank} with {myEntry.stamps} stamps. Keep going!
          </p>
        )}
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

import Image from "next/image";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { UserHeader } from "@/components/user/UserHeader";
import { LeaderboardFilterBar } from "@/components/leaderboard/FilterBar";
import {
  fetchLeaderboard,
  findRange,
  getRangeOptions,
  type RankRow,
} from "@/lib/leaderboard";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; event?: string }>;
}) {
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  if (session.mustChangePassword) redirect("/force-change-password");

  const params = await searchParams;
  const ranges = getRangeOptions();
  const range = findRange(params.range, ranges);
  const eventId =
    params.event && params.event !== "all" ? params.event : undefined;

  const events = await db.event.findMany({
    orderBy: [
      { active: "desc" },
      { startDate: "desc" },
      { createdAt: "desc" },
    ],
    select: { id: true, name: true, active: true },
  });

  const rows = await fetchLeaderboard({
    rangeStart: range.start,
    rangeEnd: range.end,
    eventId,
    limit: 100,
  });

  const myIdx = rows.findIndex((r) => r.userId === session.userId);
  const selectedEvent = events.find((e) => e.id === eventId);
  const scopeLabel = selectedEvent ? selectedEvent.name : "Everyone";

  return (
    <>
      <UserHeader active="leaderboard" />
      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full max-w-3xl space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Leaderboard
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Top stampers and accolade-earners. Ranked by stamps, then
              accolades.
            </p>
          </div>

          <LeaderboardFilterBar
            ranges={ranges}
            events={events}
            selectedRange={range.key}
            selectedEvent={eventId ?? "all"}
          />

          <section className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-3 dark:border-stone-800">
              <h2 className="text-sm font-medium">
                {scopeLabel}{" "}
                <span className="text-stone-500 dark:text-stone-400">
                  · {range.label}
                </span>
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {rows.length === 100 ? "Top 100" : `${rows.length} ranked`}
              </span>
            </div>
            <div className="grid grid-cols-[1.75rem_minmax(0,1fr)_2.75rem_2.75rem_2.5rem] items-center gap-2 border-b border-stone-200 bg-stone-50 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400 sm:grid-cols-[2rem_2.5rem_minmax(0,1fr)_3.5rem_3.5rem_3.5rem] sm:gap-3">
              <span>#</span>
              <span className="hidden sm:block" aria-hidden></span>
              <span>Name</span>
              <span className="text-right">Stamps</span>
              <span className="text-right" title="Accolades">
                ★
              </span>
              <span className="text-right">Events</span>
            </div>
            {rows.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-stone-500 dark:text-stone-400">
                Nothing to show for this filter yet.
              </p>
            ) : (
              <ol className="divide-y divide-stone-200 dark:divide-stone-800">
                {rows.map((row, i) => (
                  <RowItem
                    key={row.userId}
                    rank={i + 1}
                    row={row}
                    isMe={row.userId === session.userId}
                  />
                ))}
              </ol>
            )}
          </section>

          {myIdx >= 0 ? (
            <p className="text-center text-xs text-stone-500 dark:text-stone-400">
              You&apos;re #{myIdx + 1} with {rows[myIdx].stamps} stamps and{" "}
              {rows[myIdx].accolades} accolades for this filter.
            </p>
          ) : (
            <p className="text-center text-xs text-stone-500 dark:text-stone-400">
              You haven&apos;t earned anything in this filter yet — keep
              stamping!
            </p>
          )}
        </div>
      </main>
    </>
  );
}

function RowItem({
  rank,
  row,
  isMe,
}: {
  rank: number;
  row: RankRow;
  isMe: boolean;
}) {
  return (
    <li
      className={
        "grid grid-cols-[1.75rem_minmax(0,1fr)_2.75rem_2.75rem_2.5rem] items-center gap-2 px-4 py-3 sm:grid-cols-[2rem_2.5rem_minmax(0,1fr)_3.5rem_3.5rem_3.5rem] sm:gap-3 " +
        (isMe ? "bg-brand-50 dark:bg-brand-900/20" : "")
      }
    >
      <span className="font-mono text-sm text-stone-500 dark:text-stone-400">
        {rank}
      </span>
      <div className="relative hidden h-9 w-9 shrink-0 overflow-hidden rounded-full bg-stone-200 sm:block dark:bg-stone-800">
        {row.photoPath ? (
          <Image
            src={`/api/uploads/${row.photoPath}`}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
            {row.firstName[0]}
          </div>
        )}
      </div>
      <p className="min-w-0 truncate text-sm font-medium">
        {row.firstName} {row.lastName}
        {isMe && (
          <span className="ml-1.5 text-xs font-normal text-brand-700 dark:text-brand-400">
            you
          </span>
        )}
      </p>
      <span className="text-right font-mono text-sm font-semibold">
        {row.stamps}
      </span>
      <span className="text-right font-mono text-sm font-semibold text-stamp-700 dark:text-stamp-500">
        {row.accolades > 0 ? row.accolades : ""}
      </span>
      <span className="text-right font-mono text-xs text-stone-500 dark:text-stone-400">
        {row.events > 0 ? row.events : ""}
      </span>
    </li>
  );
}

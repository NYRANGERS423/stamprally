import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { UserHeader } from "@/components/user/UserHeader";
import { LeaderboardFilterBar } from "@/components/leaderboard/FilterBar";
import { RankRow } from "@/components/leaderboard/RankRow";
import { YouFooter } from "@/components/leaderboard/YouFooter";
import { Segmented, type SegmentedItem } from "@/components/ui/Segmented";
import { EYEBROW } from "@/lib/ui";
import {
  BOARDS,
  fetchLeaderboard,
  findRange,
  getRangeOptions,
  parseBoard,
  type Board,
} from "@/lib/leaderboard";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    board?: string;
    range?: string;
    event?: string;
  }>;
}) {
  const session = await getUserSession();
  if (!session.userId) redirect("/login");
  if (session.mustChangePassword) redirect("/force-change-password");

  const params = await searchParams;
  const board = parseBoard(params.board);
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
    board,
    limit: 100,
  });

  const myIdx = rows.findIndex((r) => r.userId === session.userId);
  const myRow = myIdx >= 0 ? rows[myIdx] : null;
  const selectedEvent = events.find((e) => e.id === eventId);
  const scopeLabel = selectedEvent ? selectedEvent.name : "Everyone";

  const segmentedItems: SegmentedItem<Board>[] = BOARDS.map((b) => ({
    value: b.key,
    label: b.label,
    href: buildBoardHref(b.key, range.key, params.event ?? "all"),
  }));

  return (
    <>
      <UserHeader active="leaderboard" />
      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full max-w-3xl space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Rank</h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {BOARDS.find((b) => b.key === board)?.hint}
            </p>
            <details className="mt-2 text-xs text-stone-500 dark:text-stone-400">
              <summary className="cursor-pointer select-none rounded px-1 py-0.5 hover:text-stone-700 hover:underline dark:hover:text-stone-200">
                How are points calculated?
              </summary>
              <div className="mt-2 space-y-1.5 px-1">
                <p>
                  <strong className="text-stone-700 dark:text-stone-300">
                    Overall
                  </strong>{" "}
                  combines your stamp points and accolade points into one
                  total — it&apos;s the headline ranking.
                </p>
                <p>
                  <strong className="text-stone-700 dark:text-stone-300">
                    Stamp pts
                  </strong>{" "}
                  is just the points from stamps you&apos;ve collected (each
                  activity has its own point value, set by an admin).
                </p>
                <p>
                  <strong className="text-stone-700 dark:text-stone-300">
                    Accolade pts
                  </strong>{" "}
                  is just the points from accolades you&apos;ve been awarded.
                </p>
                <p>
                  Counts (stamps, ★, events) still appear under each name as
                  a breakdown, but every board ranks by points.
                </p>
              </div>
            </details>
          </div>

          <div className="flex justify-center sm:justify-start">
            <Segmented<Board>
              items={segmentedItems}
              active={board}
              ariaLabel="Leaderboard board"
            />
          </div>

          <LeaderboardFilterBar
            ranges={ranges}
            events={events}
            selectedBoard={board}
            selectedRange={range.key}
            selectedEvent={eventId ?? "all"}
          />

          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-3 dark:border-stone-800">
              <h2 className={EYEBROW}>
                {scopeLabel} · {range.label}
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {rows.length === 100 ? "Top 100" : `${rows.length} ranked`}
              </span>
            </div>
            {rows.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-stone-500 dark:text-stone-400">
                Nothing to show for this filter yet.
              </p>
            ) : (
              <ol className="flex flex-col gap-1 p-2">
                {rows.map((row, i) => (
                  <RankRow
                    key={row.userId}
                    rank={i + 1}
                    row={row}
                    board={board}
                    isMe={row.userId === session.userId}
                  />
                ))}
              </ol>
            )}
          </section>

          {!myRow && (
            <p className="text-center text-xs text-stone-500 dark:text-stone-400">
              You haven&apos;t scored on this board in this filter yet.
            </p>
          )}
        </div>

        {myRow && (
          <YouFooter
            myRowId={`leaderboard-row-${myRow.userId}`}
            myRank={myIdx + 1}
            myRow={myRow}
            board={board}
          />
        )}
      </main>
    </>
  );
}

function buildBoardHref(board: Board, range: string, event: string): string {
  const p = new URLSearchParams();
  if (board !== "points") p.set("board", board);
  if (range !== "all") p.set("range", range);
  if (event !== "all") p.set("event", event);
  const qs = p.toString();
  return qs ? `/leaderboard?${qs}` : "/leaderboard";
}

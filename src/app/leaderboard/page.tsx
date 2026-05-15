import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { UserHeader } from "@/components/user/UserHeader";
import { LeaderboardFilterBar } from "@/components/leaderboard/FilterBar";
import {
  BOARDS,
  fetchLeaderboard,
  findRange,
  getRangeOptions,
  parseBoard,
  type Board,
  type RankRow,
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
              {BOARDS.find((b) => b.key === board)?.hint}
            </p>
          </div>

          <BoardSwitcher
            active={board}
            range={range.key}
            event={params.event ?? "all"}
          />

          <LeaderboardFilterBar
            ranges={ranges}
            events={events}
            selectedBoard={board}
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
                    board={board}
                    isMe={row.userId === session.userId}
                  />
                ))}
              </ol>
            )}
          </section>

          {myIdx >= 0 ? (
            <p className="text-center text-xs text-stone-500 dark:text-stone-400">
              You&apos;re #{myIdx + 1} —{" "}
              {primaryLabel(board, rows[myIdx])} on this board.
            </p>
          ) : (
            <p className="text-center text-xs text-stone-500 dark:text-stone-400">
              You haven&apos;t scored on this board in this filter yet.
            </p>
          )}
        </div>
      </main>
    </>
  );
}

function BoardSwitcher({
  active,
  range,
  event,
}: {
  active: Board;
  range: string;
  event: string;
}) {
  function href(board: Board): string {
    const p = new URLSearchParams();
    if (board !== "points") p.set("board", board);
    if (range !== "all") p.set("range", range);
    if (event !== "all") p.set("event", event);
    const qs = p.toString();
    return qs ? `/leaderboard?${qs}` : "/leaderboard";
  }
  return (
    <div className="inline-flex w-full rounded-full bg-stone-100 p-1 dark:bg-stone-800/60">
      {BOARDS.map((b) => {
        const isActive = b.key === active;
        return (
          <Link
            key={b.key}
            href={href(b.key)}
            scroll={false}
            className={
              "inline-flex h-10 flex-1 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors " +
              (isActive
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-50"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100")
            }
          >
            {b.label}
          </Link>
        );
      })}
    </div>
  );
}

function RowItem({
  rank,
  row,
  board,
  isMe,
}: {
  rank: number;
  row: RankRow;
  board: Board;
  isMe: boolean;
}) {
  const primary =
    board === "points"
      ? row.points
      : board === "stamps"
        ? row.stamps
        : row.accolades;
  return (
    <li
      className={
        "grid grid-cols-[1.75rem_minmax(0,1fr)_3.5rem] items-center gap-2 px-4 py-3 sm:grid-cols-[2rem_2.5rem_minmax(0,1fr)_4rem] sm:gap-3 " +
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
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {row.firstName} {row.lastName}
          {isMe && (
            <span className="ml-1.5 text-xs font-normal text-brand-700 dark:text-brand-400">
              you
            </span>
          )}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-stone-500 dark:text-stone-400">
          {row.stamps} stamps · {row.accolades} ★ · {row.events} events
        </p>
      </div>
      <span className="text-right font-mono text-base font-bold tabular-nums">
        {primary}
        <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {boardUnit(board)}
        </span>
      </span>
    </li>
  );
}

function primaryLabel(board: Board, row: RankRow): string {
  if (board === "points") return `${row.points} pts`;
  if (board === "stamps")
    return `${row.stamps} stamp${row.stamps === 1 ? "" : "s"}`;
  return `${row.accolades} accolade${row.accolades === 1 ? "" : "s"}`;
}

function boardUnit(board: Board): string {
  if (board === "points") return "pts";
  if (board === "stamps") return "stamps";
  return "★";
}

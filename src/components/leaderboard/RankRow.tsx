import Image from "next/image";
import Link from "next/link";
import { boardValue, type Board, type RankRow as RankRowData } from "@/lib/leaderboard-shared";

// Pass 03 / design-handoff §4.3.1 — single leaderboard row.
// Rank number is mono + tabular. Top-3 ranks get a tinted ring (gold /
// silver / bronze). Names link to the user's read-only passport
// (/u/[id]). YouPin treatment is loud when this row matches the
// current session user. The accolade peek + chevron preview from the
// design spec are deferred — they need a loader extension to surface
// each row's top accolades, which is out of scope for this pass.
export function RankRow({
  rank,
  row,
  board,
  isMe,
}: {
  rank: number;
  row: RankRowData;
  board: Board;
  isMe: boolean;
}) {
  const primary = boardValue(row, board);

  const youClasses = isMe
    ? "bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-900/30 dark:ring-brand-700"
    : "";

  return (
    <li
      id={`leaderboard-row-${row.userId}`}
      className={
        "grid grid-cols-[2rem_2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-3 sm:px-4 " +
        youClasses
      }
    >
      <RankBadge rank={rank} />
      <Avatar row={row} />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium text-stone-900 dark:text-stone-100">
          <Link
            href={`/u/${row.userId}`}
            className="truncate hover:underline focus-visible:underline"
          >
            {row.firstName} {row.lastName}
          </Link>
          {isMe && <YouPill />}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-stone-500 dark:text-stone-400">
          {row.stamps} stamps · {row.accolades} ★ · {row.events} events
        </p>
      </div>
      <PrimaryMetric value={primary} />
    </li>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const podium =
    rank === 1
      ? "ring-2 ring-amber-400 text-amber-700 dark:text-amber-300"
      : rank === 2
        ? "ring-2 ring-stone-300 text-stone-700 dark:text-stone-200"
        : rank === 3
          ? "ring-2 ring-orange-300 text-orange-700 dark:text-orange-300"
          : "text-stone-400 dark:text-stone-500";
  const isPodium = rank <= 3;
  return (
    <span
      className={
        "inline-flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-medium tabular-nums " +
        podium +
        (isPodium ? " bg-white dark:bg-stone-900" : "")
      }
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}

function Avatar({ row }: { row: RankRowData }) {
  return (
    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
      {row.photoPath ? (
        <Image
          src={`/api/uploads/${row.photoPath}`}
          alt=""
          fill
          sizes="36px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-stone-500 dark:text-stone-400">
          {row.firstName[0]}
        </div>
      )}
    </div>
  );
}

function YouPill() {
  return (
    <span className="rounded bg-brand-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
      you
    </span>
  );
}

function PrimaryMetric({ value }: { value: number }) {
  return (
    <span className="font-serif text-2xl font-medium tabular-nums text-stone-900 dark:text-stone-100">
      {value}
      <span className="ml-1 font-mono text-[10px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
        pts
      </span>
    </span>
  );
}

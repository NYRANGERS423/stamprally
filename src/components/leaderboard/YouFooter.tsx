"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Board, RankRow as RankRowData } from "@/lib/leaderboard";

// Pass 03 / design-handoff §4.3.1 — sticky footer that pins the
// current user's row when their actual row scrolls off-screen.
// Uses IntersectionObserver on a sentinel element marking the real
// row's position; only renders when (a) the user is in the list, and
// (b) their row is not visible in the viewport.
export function YouFooter({
  myRowId,
  myRank,
  myRow,
  board,
}: {
  myRowId: string;
  myRank: number;
  myRow: RankRowData;
  board: Board;
}) {
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = document.getElementById(myRowId);
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-64px 0px -80px 0px", threshold: 0 },
    );
    observerRef.current.observe(el);
    return () => observerRef.current?.disconnect();
  }, [myRowId]);

  if (!visible) return null;

  const primary =
    board === "points"
      ? myRow.points
      : board === "stamps"
        ? myRow.stamps
        : myRow.accolades;
  const unit = board === "points" ? "pts" : board === "stamps" ? "stamps" : "★";

  return (
    <div
      className="sticky bottom-0 z-20 -mx-4 mt-4 border-t border-stone-200 bg-paper/92 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 dark:border-stone-800 dark:bg-stone-900/90"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 font-mono text-xs font-semibold tabular-nums text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
          {myRank}
        </span>
        <Link
          href={`/u/${myRow.userId}`}
          className="min-w-0 flex-1 truncate text-sm font-medium text-stone-900 hover:underline dark:text-stone-100"
        >
          {myRow.firstName} {myRow.lastName}
        </Link>
        <span className="rounded bg-brand-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
          you
        </span>
        <span className="font-serif text-lg font-medium tabular-nums text-stone-900 dark:text-stone-100">
          {primary}
          <span className="ml-1 font-mono text-[10px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {unit}
          </span>
        </span>
      </div>
    </div>
  );
}

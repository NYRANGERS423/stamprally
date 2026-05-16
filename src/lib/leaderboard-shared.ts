// Isomorphic leaderboard types + the boardValue helper. Lives in its
// own file (no "server-only") so client components like <RankRow> and
// <YouFooter> can pull boardValue without dragging the server-only
// leaderboard.ts module into the client bundle.
//
// fetchLeaderboard() and the DB-touching code stay in
// src/lib/leaderboard.ts, which re-exports these for server callers
// so existing import paths keep working.

export type Board = "points" | "stamps" | "accolades";

export interface RankRow {
  userId: string;
  firstName: string;
  lastName: string;
  photoPath: string | null;
  stamps: number;
  accolades: number;
  events: number;
  stampPoints: number;
  accoladePoints: number;
  points: number; // stampPoints + accoladePoints
}

export function boardValue(row: RankRow, board: Board): number {
  if (board === "points") return row.points;
  if (board === "stamps") return row.stampPoints;
  return row.accoladePoints;
}

import { fmtTiered } from "./format";

export function fmtWeekly(v: number | undefined): string {
  return fmtTiered(v, 1);
}

export const BATTING_CAT_ORDER = ["R", "HR", "RBI", "SB", "AVG", "OPS"];
export const PITCHING_CAT_ORDER = ["W", "QS", "ERA", "WHIP", "K/9", "SV+H"];
export const BATTING_CATS = new Set(BATTING_CAT_ORDER);
export const PITCHING_CATS = new Set(PITCHING_CAT_ORDER);
export const CAT_ORDER = [...BATTING_CAT_ORDER, ...PITCHING_CAT_ORDER];
// Yahoo display_name keys — steals is "ST", not STL.
export const NBA_CAT_ORDER = ["PTS", "REB", "AST", "ST", "BLK", "TO", "FG%", "FT%", "3PTM"];
export const RATE_CATS = new Set(["AVG", "ERA", "WHIP", "OPS", "K/9", "FG%", "FT%"]);

// Position filter options (rankings controls + draft best-available).
export const MLB_POSITION_FILTERS = ["All", "C", "1B", "2B", "SS", "3B", "OF", "SP", "RP"];
export const NBA_POSITION_FILTERS = ["All", "PG", "SG", "SF", "PF", "C"];

/** Rank pill color by league-relative tier (shared by team overview + detail). */
export function rankBadgeClass(rank: number, total: number): string {
  if (rank <= 2) return "bg-green-100 text-green-800";
  if (rank <= 5) return "bg-slate-100 text-slate-600";
  if (rank <= total - 2) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

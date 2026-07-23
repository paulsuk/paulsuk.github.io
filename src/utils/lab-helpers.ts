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

/** Rank pill by league-relative tier (shared by team overview + detail).
 * Mid tiers are a neutral ink ramp, not a third hue (Phase 4 / dataviz:
 * ordinal position wants monotone lightness, and amber under 3:1 on paper
 * had no icon/label mitigation). Win/loss bookend the extremes. */
export function rankBadgeClass(rank: number, total: number): string {
  if (rank <= 2) return "bg-win/10 text-win";
  if (rank <= 5) return "bg-rule/50 text-ink-soft";
  if (rank <= total - 2) return "text-ink-faint";
  return "bg-loss/10 text-loss";
}

/** Lab player URLs accept legacy numeric Yahoo ids alongside canonical uids. */
export function isNumericPlayerParam(param: string): boolean {
  return /^\d+$/.test(param);
}

export function fmtWeekly(v: number | undefined): string {
  if (v == null) return "—";
  if (v >= 10) return v.toFixed(1);
  if (v >= 1) return v.toFixed(2);
  return v.toFixed(3);
}

export const BATTING_CAT_ORDER = ["R", "HR", "RBI", "SB", "AVG", "OPS"];
export const PITCHING_CAT_ORDER = ["W", "QS", "ERA", "WHIP", "K/9", "SV+H"];
export const BATTING_CATS = new Set(BATTING_CAT_ORDER);
export const PITCHING_CATS = new Set(PITCHING_CAT_ORDER);
export const CAT_ORDER = [...BATTING_CAT_ORDER, ...PITCHING_CAT_ORDER];
export const RATE_CATS = new Set(["AVG", "ERA", "WHIP", "OPS", "K/9", "FG%", "FT%"]);

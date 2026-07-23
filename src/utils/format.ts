// Shared numeric display formatters (extracted from 6+ inline copies).
import { API_URL } from "../api/client";

/** toFixed with trailing zeros (and a bare decimal point) stripped: 0.300 → "0.3", 1.000 → "1". */
export function fmtCompact(v: number | null | undefined, dp = 3): string {
  if (v == null) return "—";
  return v.toFixed(dp).replace(/\.?0+$/, "");
}

/** Magnitude-tiered stat display: ≥10 → bigDp, ≥1 → 2dp, else 3dp. */
export function fmtTiered(v: number | null | undefined, bigDp: 0 | 1 = 1): string {
  if (v == null) return "—";
  if (v >= 10) return v.toFixed(bigDp);
  if (v >= 1) return v.toFixed(2);
  return v.toFixed(3);
}

/** Signed score: "+1.23" / "-0.50" (zero renders with a plus). */
export function signed(v: number, dp = 2): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(dp)}`;
}

// Rate stats keep their conventional precision by NAME; percentages (keys ending
// in "%", stored as fractions) get 3dp. Everything else is a counting stat.
const STAT_DECIMALS: Record<string, number> = {
  AVG: 3, OBP: 3, SLG: 3, OPS: 3, BABIP: 3, ISO: 3, wOBA: 3,
  xBA: 3, xwOBA: 3, xSLG: 3, "xBA Against": 3,
  ERA: 2, WHIP: 2, "K/9": 2, "BB/9": 2, "K/BB": 2, FIP: 2, xFIP: 2, "HR/9": 2,
};

// Percent stats served on a 0-100 scale (Statcast / NBA efficiency panels) —
// 1dp, NOT the fraction rule. Yahoo category percents (FG%, FT%) stay fractions.
// "Hard Hit%" / "Hard Hit% Against" match the exact display labels used in
// StatcastPanel.tsx (batter vs. pitcher tiles) — reconciled against source,
// not the shorthand "HardHit%" the spec sketched.
// Pruned to exactly the "%"-ending labels that actually appear in the panel
// sources (StatcastPanel.tsx, EfficiencyPanel.tsx) and are 0-100 scale — TS%
// was removed (EfficiencyPanel computes it as a 0-1 fraction, pts / (2 *
// (fga + 0.44 * fta))); Whiff%/Chase%/CSW%/eFG% were removed as unreachable
// (no panel passes those labels to formatStat).
// USG% scale is UNVERIFIED from this repo — it passes through as-is from the
// external stats payload; kept here pending live-data confirmation.
const PERCENT_100_KEYS = new Set([
  "Barrel%", "Hard Hit%", "Hard Hit% Against", "USG%",
]);

/**
 * Stat-aware value formatter for user-facing stat lines. Rate stats keep their
 * decimals by name (AVG/OPS → 3dp, ERA/WHIP → 2dp, any "%" → 3dp); counting
 * stats (HR, PTS, REB, …) show 1 decimal so a whole value reads "36.0", not "36".
 * Without a key, falls back to magnitude (rates are < 1).
 */
export function formatStat(value: number, key?: string): string {
  if (key) {
    if (key in STAT_DECIMALS) return value.toFixed(STAT_DECIMALS[key]);
    if (key.endsWith("%")) {
      return PERCENT_100_KEYS.has(key) ? value.toFixed(1) : value.toFixed(3);
    }
    return value.toFixed(1);
  }
  return Math.abs(value) < 1 ? value.toFixed(3) : value.toFixed(1);
}

/** Team logo asset URL — name slugified the same way the publisher does. */
export function logoUrl(slug: string, teamName: string, season: number): string {
  const nameSlug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${API_URL}/api/${slug}/assets/logo-${nameSlug}-${season}`;
}

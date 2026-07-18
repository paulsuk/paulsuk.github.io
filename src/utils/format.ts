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

/** Team logo asset URL — name slugified the same way the publisher does. */
export function logoUrl(slug: string, teamName: string, season: number): string {
  const nameSlug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${API_URL}/api/${slug}/assets/logo-${nameSlug}-${season}`;
}

import type { SeasonRecord, FranchiseSeasonRecord } from "../api/types";

type AnySeasonRecord = SeasonRecord | FranchiseSeasonRecord;

export interface FinishGroup {
  rank: number;
  count: number;
  years: number[];
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function finishBadge(finish: number): string {
  if (finish === 1) return "\u{1F947}";
  if (finish === 2) return "\u{1F948}";
  if (finish === 3) return "\u{1F949}";
  return ordinal(finish);
}

export function getMedals(records: AnySeasonRecord[]): string[] {
  const medals: string[] = [];
  for (const sr of records) {
    if (sr.finish === 1) medals.push("\u{1F947}");
    else if (sr.finish === 2) medals.push("\u{1F948}");
    else if (sr.finish === 3) medals.push("\u{1F949}");
  }
  return medals;
}

export function getChampionshipYears(records: AnySeasonRecord[]): number[] {
  return records.filter((sr) => sr.finish === 1).map((sr) => sr.season);
}

/**
 * Winning percentage: (W + ½T) / (W + L + T), formatted as ".xxx" (no leading zero).
 */
export function winPct(wins: number, losses: number, ties: number): string {
  const total = wins + losses + ties;
  return total > 0 ? ((wins + 0.5 * ties) / total).toFixed(3).slice(1) : ".000";
}

/**
 * Format a season number for display. Basketball uses "YY-YY" format (e.g. "24-25"),
 * everything else returns the year as-is (e.g. "2024").
 */
export function formatSeason(season: number, slug: string): string {
  if (slug === "basketball") {
    const startYY = String(season).slice(-2);
    const endYY = String(season + 1).slice(-2);
    return `${startYY}-${endYY}`;
  }
  return String(season);
}

export function getFinishGroups(records: AnySeasonRecord[], field: "playoff_seed" | "finish"): FinishGroup[] {
  const groups = new Map<number, number[]>();
  for (const sr of records) {
    const val = sr[field];
    if (val == null || val <= 0) continue;
    const years = groups.get(val) ?? [];
    years.push(sr.season);
    groups.set(val, years);
  }
  return Array.from(groups.entries())
    .map(([rank, years]) => ({ rank, count: years.length, years }))
    .sort((a, b) => a.rank - b.rank);
}

/**
 * Format finish groups as a compact string for display.
 * Example: "1sts: 2 (2022, 2024), 2nds: 1 (2023)"
 */
export function formatFinishGroups(groups: FinishGroup[], slug: string): string {
  if (groups.length === 0) return "N/A";
  return groups
    .map((g) => `${ordinal(g.rank)}s: ${g.count} (${g.years.map((y) => formatSeason(y, slug)).join(", ")})`)
    .join(", ");
}

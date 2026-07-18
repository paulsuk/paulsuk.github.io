import type { SeasonRecord, FranchiseSeasonRecord, ScoringMode, StandingEntry } from "../api/types";

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
 * Winning percentage: (W + ½T) / (W + L + T), formatted as ".xxx" (no leading
 * zero). A perfect record keeps its leading 1 ("1.000", not ".000").
 */
export function winPct(wins: number, losses: number, ties: number): string {
  const total = wins + losses + ties;
  const pct = total > 0 ? (wins + 0.5 * ties) / total : 0;
  const s = pct.toFixed(3);
  return s.startsWith("0") ? s.slice(1) : s;
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
 * Raw stat value for display: 4 -> "4", .333 -> "0.333", 2.5 -> "2.50".
 */
export function formatStatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  if (Math.abs(v) < 1) return v.toFixed(3);
  return v.toFixed(2);
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

/** A standings entry paired with its display position after re-ranking. */
export type RankedStanding = StandingEntry & { displayRank: number };

/**
 * Standings ordered for display. The served `rank` follows matchup records,
 * but category (H2H-cat) leagues rank by category win pct — re-derive the
 * order client-side for category mode (ties count half; tiebreak: cat wins,
 * then team name). Matchup mode keeps the served rank order.
 */
export function rankStandings(standings: StandingEntry[], mode: ScoringMode): RankedStanding[] {
  const sorted = [...standings];
  if (mode === "category") {
    const pct = (s: StandingEntry) => {
      const games = s.cat_wins + s.cat_losses + s.cat_ties;
      return games === 0 ? 0 : (s.cat_wins + s.cat_ties / 2) / games;
    };
    sorted.sort(
      (a, b) =>
        pct(b) - pct(a) || b.cat_wins - a.cat_wins || a.team_name.localeCompare(b.team_name)
    );
  } else {
    sorted.sort((a, b) => a.rank - b.rank);
  }
  return sorted.map((s, i) => ({ ...s, displayRank: i + 1 }));
}

/** Record triple for the active scoring mode (category leagues re-read cat_*). */
export function recordFor(
  entry: {
    wins: number; losses: number; ties: number;
    cat_wins: number; cat_losses: number; cat_ties: number;
  },
  mode: ScoringMode,
): { w: number; l: number; t: number } {
  return mode === "category"
    ? { w: entry.cat_wins, l: entry.cat_losses, t: entry.cat_ties }
    : { w: entry.wins, l: entry.losses, t: entry.ties };
}

/** "W-L-T" display string. */
export function formatRecord({ w, l, t }: { w: number; l: number; t: number }): string {
  return `${w}-${l}-${t}`;
}

import type { MatchupSummary } from "../api/types";

/** The week's marquee matchup: smallest category margin, ties broken by most categories decided. */
export function closestMatchup(matchups: MatchupSummary[]): MatchupSummary | null {
  if (matchups.length === 0) return null;
  return [...matchups].sort((a, b) => {
    const marginA = Math.abs(a.cats_won_1 - a.cats_won_2);
    const marginB = Math.abs(b.cats_won_1 - b.cats_won_2);
    if (marginA !== marginB) return marginA - marginB;
    return b.cats_won_1 + b.cats_won_2 - (a.cats_won_1 + a.cats_won_2);
  })[0];
}

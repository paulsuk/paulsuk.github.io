import type { FranchiseSeasonRecord } from "../api/types";

export interface AggregatedFranchiseStats {
  wins: number;
  losses: number;
  ties: number;
  cat_wins: number;
  cat_losses: number;
  cat_ties: number;
  championships: number;
  best_finish: number | null;
  worst_finish: number | null;
}

export const EMPTY_FRANCHISE_STATS: AggregatedFranchiseStats = {
  wins: 0, losses: 0, ties: 0,
  cat_wins: 0, cat_losses: 0, cat_ties: 0,
  championships: 0, best_finish: null, worst_finish: null,
};

/**
 * Roll a set of season records up into franchise-level stats — the
 * manager-view aggregation on the franchise detail page. Finishes of
 * null/0 (unfinished seasons) don't count toward best/worst.
 */
export function aggregateSeasonRecords(records: FranchiseSeasonRecord[]): AggregatedFranchiseStats {
  const out = { ...EMPTY_FRANCHISE_STATS };
  for (const sr of records) {
    out.wins += sr.wins;
    out.losses += sr.losses;
    out.ties += sr.ties;
    out.cat_wins += sr.cat_wins;
    out.cat_losses += sr.cat_losses;
    out.cat_ties += sr.cat_ties;
    if (sr.finish === 1) out.championships++;
    if (sr.finish != null && sr.finish > 0) {
      if (out.best_finish == null || sr.finish < out.best_finish) out.best_finish = sr.finish;
      if (out.worst_finish == null || sr.finish > out.worst_finish) out.worst_finish = sr.finish;
    }
  }
  return out;
}

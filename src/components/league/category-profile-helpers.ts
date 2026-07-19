import type { StandingEntry, TeamPScoreEntry } from "../../api/types";

export interface CategoryMatrixRow {
  team_key: string;
  team_name: string;
  entry: TeamPScoreEntry;
}

export interface CategoryMatrix {
  categories: string[];
  rows: CategoryMatrixRow[];
}

export function buildCategoryMatrix(
  teams: TeamPScoreEntry[],
  standings: StandingEntry[],
): CategoryMatrix {
  const byKey = new Map(standings.map((s) => [s.team_key, s]));
  const rows = teams.map((entry) => ({
    team_key: entry.team_key,
    team_name: byKey.get(entry.team_key)?.team_name ?? entry.team_key,
    entry,
    standingsRank: byKey.get(entry.team_key)?.rank ?? Number.MAX_SAFE_INTEGER,
  }));
  rows.sort((a, b) => a.standingsRank - b.standingsRank);
  return {
    categories: teams[0]?.categories.map((c) => c.category) ?? [],
    rows: rows.map(({ standingsRank: _standingsRank, ...row }) => row),
  };
}

export function heatAlpha(rank: number, teamCount: number): number {
  if (teamCount <= 1) return 1;
  return 1 - (rank - 1) / (teamCount - 1);
}

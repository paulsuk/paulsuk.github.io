import type { StandingsHistoryEntry } from "../../api/types";

export const STEP_X = 48; // px per week column
export const ROW_H = 26; // px per rank slot
export const PAD_X = 36; // left gutter for rank numerals
export const PAD_Y = 24; // top gutter for week numerals
export const LABEL_W = 148; // right gutter for team labels

export interface RacePoint {
  week: number;
  rank: number;
  x: number;
  y: number;
}

export interface RaceSeries {
  team_key: string;
  team_name: string;
  manager: string;
  franchise_id: string | null;
  final: StandingsHistoryEntry;
  points: RacePoint[];
}

export interface RaceLayout {
  weeks: number[];
  teamCount: number;
  width: number;
  height: number;
  series: RaceSeries[];
}

export function xForWeekIndex(i: number): number {
  return PAD_X + i * STEP_X + STEP_X / 2;
}

export function yForRank(rank: number): number {
  return PAD_Y + (rank - 1) * ROW_H + ROW_H / 2;
}

export function buildRaceLayout(entries: StandingsHistoryEntry[]): RaceLayout {
  const weeks = [...new Set(entries.map((e) => e.week))].sort((a, b) => a - b);
  const weekIndex = new Map(weeks.map((w, i) => [w, i]));

  const byTeam = new Map<string, StandingsHistoryEntry[]>();
  for (const e of entries) {
    const rows = byTeam.get(e.team_key) ?? [];
    rows.push(e);
    byTeam.set(e.team_key, rows);
  }

  const series: RaceSeries[] = [...byTeam.values()].map((rows) => {
    const sorted = [...rows].sort((a, b) => a.week - b.week);
    const final = sorted[sorted.length - 1];
    return {
      team_key: final.team_key,
      team_name: final.team_name,
      manager: final.manager,
      franchise_id: final.franchise_id ?? null,
      final,
      points: sorted.map((e) => ({
        week: e.week,
        rank: e.rank,
        x: xForWeekIndex(weekIndex.get(e.week)!),
        y: yForRank(e.rank),
      })),
    };
  });
  series.sort((a, b) => a.final.rank - b.final.rank);

  return {
    weeks,
    teamCount: series.length,
    width: PAD_X + weeks.length * STEP_X + LABEL_W,
    height: PAD_Y + series.length * ROW_H + 8,
    series,
  };
}

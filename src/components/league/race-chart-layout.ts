import type { ScoringMode, StandingsHistoryEntry } from "../../api/types";

export const STEP_X = 48; // px per week column
export const ROW_H = 26; // px per team (vertical resolution)
export const PAD_X = 44; // left gutter for value labels (".500", "+6", …)
export const PAD_Y = 24; // top gutter for week numerals
export const LABEL_W = 148; // right gutter for team labels

export interface RacePoint {
  week: number;
  value: number; // games above/below .500 through this week
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

export interface RaceTick {
  value: number;
  y: number;
  label: string;
}

export interface RaceLayout {
  weeks: number[];
  teamCount: number;
  width: number;
  height: number;
  series: RaceSeries[];
  ticks: RaceTick[];
  zeroY: number;
}

export function xForWeekIndex(i: number): number {
  return PAD_X + i * STEP_X + STEP_X / 2;
}

/** Games above/below .500 through a given week — categories for category
 * leagues, matchups for matchup leagues. Ties are neutral, so (W − L) / 2. */
function gamesOver500(e: StandingsHistoryEntry, mode: ScoringMode): number {
  return mode === "category"
    ? (e.cat_wins - e.cat_losses) / 2
    : (e.wins - e.losses) / 2;
}

function fmtTick(v: number): string {
  if (v === 0) return ".500";
  const mag = Number.isInteger(v) ? String(Math.abs(v)) : Math.abs(v).toFixed(1);
  return (v > 0 ? "+" : "−") + mag;
}

export function buildRaceLayout(
  entries: StandingsHistoryEntry[],
  mode: ScoringMode,
): RaceLayout {
  const weeks = [...new Set(entries.map((e) => e.week))].sort((a, b) => a - b);
  const weekIndex = new Map(weeks.map((w, i) => [w, i]));

  const byTeam = new Map<string, StandingsHistoryEntry[]>();
  for (const e of entries) {
    const rows = byTeam.get(e.team_key) ?? [];
    rows.push(e);
    byTeam.set(e.team_key, rows);
  }

  // Symmetric domain around .500 so the baseline sits in the middle.
  const rawMax = Math.max(0.5, ...entries.map((e) => Math.abs(gamesOver500(e, mode))));
  const maxTick = Math.max(1, Math.ceil(rawMax));
  const teamCount = byTeam.size;
  const plotH = ROW_H * Math.max(teamCount, 6);
  const yForValue = (v: number) => PAD_Y + (1 - (v + maxTick) / (2 * maxTick)) * plotH;

  const series: RaceSeries[] = [...byTeam.values()].map((rows) => {
    const sorted = [...rows].sort((a, b) => a.week - b.week);
    const final = sorted[sorted.length - 1];
    return {
      team_key: final.team_key,
      team_name: final.team_name,
      manager: final.manager,
      franchise_id: final.franchise_id ?? null,
      final,
      points: sorted.map((e) => {
        const value = gamesOver500(e, mode);
        return { week: e.week, value, x: xForWeekIndex(weekIndex.get(e.week)!), y: yForValue(value) };
      }),
    };
  });
  // Best record on top (draw order for the end-label stack).
  series.sort((a, b) => gamesOver500(b.final, mode) - gamesOver500(a.final, mode));

  const step = maxTick <= 3 ? 1 : maxTick <= 6 ? 2 : maxTick <= 15 ? 5 : 10;
  const ticks: RaceTick[] = [];
  for (let v = 0; v <= maxTick; v += step) {
    ticks.push({ value: v, y: yForValue(v), label: fmtTick(v) });
    if (v > 0) ticks.push({ value: -v, y: yForValue(-v), label: fmtTick(-v) });
  }

  return {
    weeks,
    teamCount,
    width: PAD_X + weeks.length * STEP_X + LABEL_W,
    height: PAD_Y + plotH + 8,
    series,
    ticks,
    zeroY: yForValue(0),
  };
}

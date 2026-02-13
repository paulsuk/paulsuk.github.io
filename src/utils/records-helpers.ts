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

export function getFinishGroups(records: AnySeasonRecord[], field: "playoff_seed" | "finish"): FinishGroup[] {
  const groups = new Map<number, number[]>();
  for (const sr of records) {
    const val = sr[field];
    if (val == null) continue;
    const years = groups.get(val) ?? [];
    years.push(sr.season);
    groups.set(val, years);
  }
  return Array.from(groups.entries())
    .map(([rank, years]) => ({ rank, count: years.length, years }))
    .sort((a, b) => a.rank - b.rank);
}

import { describe, expect, it } from "vitest";
import { formatRecord, formatStatValue, recordFor } from "./records-helpers";

describe("formatStatValue", () => {
  it("formats integers plainly", () => {
    expect(formatStatValue(4)).toBe("4");
    expect(formatStatValue(0)).toBe("0");
  });
  it("formats sub-1 rates to 3 decimals", () => {
    expect(formatStatValue(0.333)).toBe("0.333");
    expect(formatStatValue(0.98)).toBe("0.980");
  });
  it("formats other decimals to 2 places", () => {
    expect(formatStatValue(2.5)).toBe("2.50");
    expect(formatStatValue(13.75)).toBe("13.75");
  });
});

import { rankStandings } from "./records-helpers";
import type { StandingEntry } from "../api/types";

function entry(over: Partial<StandingEntry> & { team_name: string }): StandingEntry {
  return {
    team_key: over.team_name,
    manager: "m",
    wins: 0, losses: 0, ties: 0,
    cat_wins: 0, cat_losses: 0, cat_ties: 0,
    rank: 0,
    ...over,
  };
}

describe("rankStandings", () => {
  // Mirrors the real bug: served rank follows matchup W-L, but by category pct
  // JoeBuck (.527) and Yandy (.521) both sit above Williamsburg (.518).
  const served = [
    entry({ team_name: "Williamsburg", rank: 3, cat_wins: 79, cat_losses: 73, cat_ties: 16 }),
    entry({ team_name: "JoeBuck", rank: 4, cat_wins: 82, cat_losses: 73, cat_ties: 13 }),
    entry({ team_name: "Yandy", rank: 7, cat_wins: 83, cat_losses: 76, cat_ties: 9 }),
  ];

  it("category mode re-ranks by category win pct", () => {
    const ranked = rankStandings(served, "category");
    expect(ranked.map((s) => s.team_name)).toEqual(["JoeBuck", "Yandy", "Williamsburg"]);
    expect(ranked.map((s) => s.displayRank)).toEqual([1, 2, 3]);
  });

  it("matchup mode keeps the served rank order", () => {
    const ranked = rankStandings([served[2], served[0], served[1]], "matchup");
    expect(ranked.map((s) => s.team_name)).toEqual(["Williamsburg", "JoeBuck", "Yandy"]);
    expect(ranked.map((s) => s.displayRank)).toEqual([1, 2, 3]);
  });

  it("counts category ties as half a win", () => {
    const a = entry({ team_name: "A", cat_wins: 5, cat_losses: 5, cat_ties: 0 }); // .500
    const b = entry({ team_name: "B", cat_wins: 4, cat_losses: 4, cat_ties: 2 }); // .500, fewer wins
    const c = entry({ team_name: "C", cat_wins: 4, cat_losses: 6, cat_ties: 0 }); // .400
    const ranked = rankStandings([c, b, a], "category");
    expect(ranked.map((s) => s.team_name)).toEqual(["A", "B", "C"]);
  });
});

describe("recordFor / formatRecord", () => {
  const entry = {
    wins: 10, losses: 4, ties: 2,
    cat_wins: 80, cat_losses: 50, cat_ties: 6,
  };

  it("reads matchup fields in matchup mode", () => {
    expect(recordFor(entry, "matchup")).toEqual({ w: 10, l: 4, t: 2 });
  });

  it("reads category fields in category mode", () => {
    expect(recordFor(entry, "category")).toEqual({ w: 80, l: 50, t: 6 });
  });

  it("formats W-L-T", () => {
    expect(formatRecord({ w: 10, l: 4, t: 2 })).toBe("10-4-2");
  });
});

import { winPct, ordinal, formatSeason, getFinishGroups, formatFinishGroups } from "./records-helpers";
import type { FranchiseSeasonRecord } from "../api/types";

describe("winPct", () => {
  it("counts ties as half a win, formatted .xxx", () => {
    expect(winPct(10, 4, 2)).toBe(".688");
  });

  it("keeps the leading 1 on a perfect record (was rendered '.000')", () => {
    expect(winPct(3, 0, 0)).toBe("1.000");
  });

  it("handles zero games and winless records", () => {
    expect(winPct(0, 0, 0)).toBe(".000");
    expect(winPct(0, 5, 0)).toBe(".000");
  });
});

describe("ordinal", () => {
  it("handles st/nd/rd/th including the 11-13 exceptions", () => {
    expect(ordinal(1)).toBe("1st");
    expect(ordinal(2)).toBe("2nd");
    expect(ordinal(3)).toBe("3rd");
    expect(ordinal(4)).toBe("4th");
    expect(ordinal(11)).toBe("11th");
    expect(ordinal(12)).toBe("12th");
    expect(ordinal(13)).toBe("13th");
    expect(ordinal(21)).toBe("21st");
  });
});

describe("formatSeason", () => {
  it("uses YY-YY for basketball, plain year otherwise", () => {
    expect(formatSeason(2024, "basketball")).toBe("24-25");
    expect(formatSeason(2024, "baseball")).toBe("2024");
  });
});

describe("finish groups", () => {
  const rec = (season: number, finish: number | null): FranchiseSeasonRecord => ({
    season, team_name: "T", manager: "M",
    wins: 0, losses: 0, ties: 0, cat_wins: 0, cat_losses: 0, cat_ties: 0,
    finish, playoff_seed: null,
  });

  it("groups seasons by finish, skipping null/zero, sorted by rank", () => {
    const groups = getFinishGroups(
      [rec(2022, 1), rec(2023, 2), rec(2024, 1), rec(2025, null), rec(2026, 0)],
      "finish",
    );
    expect(groups).toEqual([
      { rank: 1, count: 2, years: [2022, 2024] },
      { rank: 2, count: 1, years: [2023] },
    ]);
  });

  it("formats groups compactly with season formatting", () => {
    const groups = getFinishGroups([rec(2022, 1), rec(2024, 1), rec(2023, 2)], "finish");
    expect(formatFinishGroups(groups, "baseball")).toBe("1sts: 2 (2022, 2024), 2nds: 1 (2023)");
    expect(formatFinishGroups([], "baseball")).toBe("N/A");
  });
});

describe("rankStandings tiebreak chain", () => {
  const entry = (name: string, cw: number, cl: number, ct: number, rank: number): StandingEntry => ({
    team_key: name, team_name: name, manager: "M",
    wins: 0, losses: 0, ties: 0,
    cat_wins: cw, cat_losses: cl, cat_ties: ct, rank,
  });

  it("equal pct breaks on cat_wins, then team name", () => {
    // A and B: identical pct (.500) and equal cat wins -> name order.
    // C: same pct but MORE cat wins -> ahead of both.
    const ranked = rankStandings(
      [entry("Bravo", 30, 30, 0, 1), entry("Alpha", 30, 30, 0, 2), entry("Charlie", 40, 40, 0, 3)],
      "category",
    );
    expect(ranked.map((s) => s.team_name)).toEqual(["Charlie", "Alpha", "Bravo"]);
    expect(ranked.map((s) => s.displayRank)).toEqual([1, 2, 3]);
  });
});

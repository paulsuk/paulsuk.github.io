import { describe, expect, it } from "vitest";
import { formatStatValue } from "./records-helpers";

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

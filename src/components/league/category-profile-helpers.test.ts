import { describe, expect, it } from "vitest";
import type { StandingEntry, TeamPScoreEntry } from "../../api/types";
import { buildCategoryMatrix, heatAlpha } from "./category-profile-helpers";

function team(key: string, total: number): TeamPScoreEntry {
  return {
    team_key: key, total_per_week: total,
    categories: [
      { category: "HR", score_per_week: 1.0, rank: 1 },
      { category: "SB", score_per_week: 0.5, rank: 2 },
    ],
  };
}

function standing(key: string, rank: number): StandingEntry {
  return {
    team_key: key, team_name: `Name ${key}`, manager: `M${key}`,
    wins: 0, losses: 0, ties: 0, cat_wins: 0, cat_losses: 0, cat_ties: 0, rank,
  } as StandingEntry;
}

describe("buildCategoryMatrix", () => {
  it("orders rows by standings rank and joins team names", () => {
    const m = buildCategoryMatrix([team("a", 5), team("b", 9)], [standing("b", 1), standing("a", 2)]);
    expect(m.rows.map((r) => r.team_key)).toEqual(["b", "a"]);
    expect(m.rows[0].team_name).toBe("Name b");
    expect(m.categories).toEqual(["HR", "SB"]);
  });

  it("falls back to team_key when a team is missing from standings", () => {
    const m = buildCategoryMatrix([team("x", 5)], []);
    expect(m.rows[0].team_name).toBe("x");
  });

  it("returns empty categories for no teams", () => {
    expect(buildCategoryMatrix([], []).categories).toEqual([]);
  });
});

describe("heatAlpha", () => {
  it("maps best rank to 1 and worst to 0", () => {
    expect(heatAlpha(1, 12)).toBe(1);
    expect(heatAlpha(12, 12)).toBe(0);
  });

  it("handles a single team without dividing by zero", () => {
    expect(heatAlpha(1, 1)).toBe(1);
  });
});

import { describe, expect, it } from "vitest";
import type { MatchupSummary } from "../api/types";
import { closestMatchup } from "./matchup-helpers";

function m(over: Partial<MatchupSummary>): MatchupSummary {
  return {
    team_1_name: "A", team_2_name: "B", cats_won_1: 0, cats_won_2: 0, ...over,
  } as MatchupSummary;
}

describe("closestMatchup", () => {
  it("picks the smallest category margin", () => {
    const pick = closestMatchup([
      m({ team_1_name: "Blowout", cats_won_1: 10, cats_won_2: 1 }),
      m({ team_1_name: "Nailbiter", cats_won_1: 6, cats_won_2: 5 }),
    ]);
    expect(pick?.team_1_name).toBe("Nailbiter");
  });

  it("breaks margin ties by more categories decided", () => {
    const pick = closestMatchup([
      m({ team_1_name: "Quiet", cats_won_1: 3, cats_won_2: 2 }),
      m({ team_1_name: "Loud", cats_won_1: 6, cats_won_2: 5 }),
    ]);
    expect(pick?.team_1_name).toBe("Loud");
  });

  it("returns null for no matchups", () => {
    expect(closestMatchup([])).toBeNull();
  });
});

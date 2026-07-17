import { describe, expect, it } from "vitest";
import { LEAGUES, defaultScoringMode, leagueBySlug, leagueBySportCode } from "./league-config";

describe("league-config", () => {
  it("has both leagues with distinct slugs and sport codes", () => {
    expect(LEAGUES.map((l) => l.slug).sort()).toEqual(["baseball", "basketball"]);
    expect(LEAGUES.map((l) => l.sportCode).sort()).toEqual(["mlb", "nba"]);
  });
  it("maps slug -> config and sportCode -> config", () => {
    expect(leagueBySlug("baseball")?.sportCode).toBe("mlb");
    expect(leagueBySportCode("nba")?.slug).toBe("basketball");
    expect(leagueBySlug("chess")).toBeNull();
  });
  it("preserves scoring-mode defaults", () => {
    expect(defaultScoringMode("baseball")).toBe("category");
    expect(defaultScoringMode("basketball")).toBe("matchup");
  });
});

import { describe, expect, it } from "vitest";
import {
  LEAGUES,
  defaultScoringMode,
  legacyLabPath,
  leagueBySlug,
  leagueBySportCode,
} from "./league-config";

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

describe("legacyLabPath", () => {
  it("rewrites deep links preserving sub-path", () => {
    expect(legacyLabPath("/lab/mlb/players/123", "baseball")).toBe("/lab/baseball/players/123");
    expect(legacyLabPath("/lab/nba/teams/5", "basketball")).toBe("/lab/basketball/teams/5");
  });
  it("handles bare legacy paths", () => {
    expect(legacyLabPath("/lab/mlb", "baseball")).toBe("/lab/baseball");
    expect(legacyLabPath("/lab/nba/", "basketball")).toBe("/lab/basketball");
  });
});

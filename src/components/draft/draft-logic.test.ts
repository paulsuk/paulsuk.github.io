import { describe, expect, it } from "vitest";
import type { DraftPreload, DraftPreloadTeam, SavedDraftSession } from "../../api/types";
import { deriveOrderedTeams, generateDraftOrder, parseSaved, restorePayload } from "./draft-logic";

const teams: DraftPreloadTeam[] = [
  { team_key: "l.t.1", name: "Alpha", manager_name: "A" },
  { team_key: "l.t.2", name: "Beta", manager_name: "B" },
  { team_key: "l.t.3", name: "Gamma", manager_name: "C" },
];

function preload(over: Partial<DraftPreload>): DraftPreload {
  return {
    league_key: "l",
    season: 2026,
    teams,
    draft_order: [],
    keepers: [],
    num_rounds: 2,
    num_teams: 3,
    ...over,
  };
}

describe("generateDraftOrder", () => {
  it("numbers picks linearly across rounds in team order", () => {
    const order = generateDraftOrder(teams, 2);
    expect(order).toHaveLength(6);
    expect(order[0]).toEqual({ pick_number: 1, team_id: "l.t.1", round: 1 });
    expect(order[3]).toEqual({ pick_number: 4, team_id: "l.t.1", round: 2 });
    expect(order[5]).toEqual({ pick_number: 6, team_id: "l.t.3", round: 2 });
  });
});

describe("deriveOrderedTeams", () => {
  it("uses round-1 pick order when the synced order covers every team", () => {
    const p = preload({
      draft_order: [
        { pick_number: 2, round: 1, team_key: "l.t.1", player_key: null },
        { pick_number: 1, round: 1, team_key: "l.t.3", player_key: null },
        { pick_number: 3, round: 1, team_key: "l.t.2", player_key: null },
        { pick_number: 4, round: 2, team_key: "l.t.3", player_key: null },
      ],
    });
    expect(deriveOrderedTeams(p).map((t) => t.team_key)).toEqual(["l.t.3", "l.t.1", "l.t.2"]);
  });

  it("falls back to team_key sort when the order is empty or incomplete", () => {
    expect(deriveOrderedTeams(preload({})).map((t) => t.team_key)).toEqual(["l.t.1", "l.t.2", "l.t.3"]);
    const partial = preload({
      draft_order: [{ pick_number: 1, round: 1, team_key: "l.t.2", player_key: null }],
    });
    expect(deriveOrderedTeams(partial).map((t) => t.team_key)).toEqual(["l.t.1", "l.t.2", "l.t.3"]);
  });
});

describe("parseSaved / restorePayload", () => {
  const saved: SavedDraftSession = {
    session_id: "s1",
    config: {
      league_slug: "baseball",
      season: 2026,
      my_team_id: "l.t.1",
      draft_order: [],
      keepers: [],
    },
    picks: [55, 42],
  };

  it("round-trips a valid payload and tolerates garbage", () => {
    expect(parseSaved(JSON.stringify(saved))).toEqual(saved);
    expect(parseSaved(null)).toBeNull();
    expect(parseSaved("{not json")).toBeNull();
  });

  it("restore payload replays the config with its picks", () => {
    expect(restorePayload(saved)).toEqual({ ...saved.config, picks_made: [55, 42] });
  });
});

import { describe, expect, it } from "vitest";
import type { FranchiseSeasonRecord } from "../api/types";
import { aggregateSeasonRecords } from "./franchise-helpers";

function season(over: Partial<FranchiseSeasonRecord>): FranchiseSeasonRecord {
  return {
    season: 2024,
    team_name: "T",
    manager: "M",
    wins: 0, losses: 0, ties: 0,
    cat_wins: 0, cat_losses: 0, cat_ties: 0,
    finish: null, playoff_seed: null,
    ...over,
  };
}

describe("aggregateSeasonRecords", () => {
  it("sums W/L/T and category records across seasons", () => {
    const out = aggregateSeasonRecords([
      season({ wins: 10, losses: 4, ties: 1, cat_wins: 70, cat_losses: 40, cat_ties: 5 }),
      season({ wins: 8, losses: 6, ties: 0, cat_wins: 60, cat_losses: 50, cat_ties: 2 }),
    ]);
    expect(out.wins).toBe(18);
    expect(out.losses).toBe(10);
    expect(out.ties).toBe(1);
    expect(out.cat_wins).toBe(130);
    expect(out.cat_ties).toBe(7);
  });

  it("counts championships and tracks best/worst finish", () => {
    const out = aggregateSeasonRecords([
      season({ finish: 1 }),
      season({ finish: 4 }),
      season({ finish: 1 }),
      season({ finish: 7 }),
    ]);
    expect(out.championships).toBe(2);
    expect(out.best_finish).toBe(1);
    expect(out.worst_finish).toBe(7);
  });

  it("ignores null/zero finishes (unfinished seasons)", () => {
    const out = aggregateSeasonRecords([season({ finish: null }), season({ finish: 0 })]);
    expect(out.championships).toBe(0);
    expect(out.best_finish).toBeNull();
    expect(out.worst_finish).toBeNull();
  });

  it("returns the empty shape for no records", () => {
    expect(aggregateSeasonRecords([])).toEqual({
      wins: 0, losses: 0, ties: 0,
      cat_wins: 0, cat_losses: 0, cat_ties: 0,
      championships: 0, best_finish: null, worst_finish: null,
    });
  });
});

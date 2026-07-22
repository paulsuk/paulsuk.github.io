import { describe, expect, it } from "vitest";
import type { StandingsHistoryEntry } from "../../api/types";
import { PAD_X, STEP_X, LABEL_W, buildRaceLayout, xForWeekIndex } from "./race-chart-layout";

function entry(over: Partial<StandingsHistoryEntry>): StandingsHistoryEntry {
  return {
    season: 2026, week: 1, team_key: "t1", team_name: "Team 1", manager: "M1",
    franchise_id: "franchise_1", rank: 1, wins: 0, losses: 0, ties: 0,
    cat_wins: 0, cat_losses: 0, cat_ties: 0, ...over,
  };
}

describe("xForWeekIndex", () => {
  it("pins the x formula", () => {
    expect(xForWeekIndex(0)).toBe(PAD_X + STEP_X / 2);
    expect(xForWeekIndex(1)).toBe(PAD_X + STEP_X + STEP_X / 2);
  });
});

describe("buildRaceLayout (games above/below .500)", () => {
  // matchup mode: value = (wins − losses) / 2
  const entries = [
    entry({ week: 1, team_key: "a", wins: 2, losses: 4 }),                        // −1
    entry({ week: 1, team_key: "b", team_name: "Team B", wins: 4, losses: 2 }),   // +1
    entry({ week: 2, team_key: "a", wins: 6, losses: 2 }),                        // +2
    entry({ week: 2, team_key: "b", team_name: "Team B", wins: 3, losses: 5 }),   // −1
  ];

  it("computes point value as games above/below .500 (matchup mode)", () => {
    const a = buildRaceLayout(entries, "matchup").series.find((s) => s.team_key === "a")!;
    expect(a.points.map((p) => p.week)).toEqual([1, 2]);
    expect(a.points.map((p) => p.value)).toEqual([-1, 2]);
    expect(a.points[0].x).toBe(xForWeekIndex(0));
  });

  it("uses the category record in category mode", () => {
    const cat = [
      entry({ week: 1, team_key: "a", cat_wins: 7, cat_losses: 3 }),                       // +2
      entry({ week: 1, team_key: "b", team_name: "Team B", cat_wins: 3, cat_losses: 7 }),  // −2
    ];
    const a = buildRaceLayout(cat, "category").series.find((s) => s.team_key === "a")!;
    expect(a.points[0].value).toBe(2);
  });

  it("orders series by final value (best on top) and maps higher value to a smaller y", () => {
    const layout = buildRaceLayout(entries, "matchup");
    expect(layout.series.map((s) => s.team_key)).toEqual(["a", "b"]); // a final +2, b final −1
    const a = layout.series[0];
    expect(a.points[1].y).toBeLessThan(a.points[0].y); // +2 sits above −1
  });

  it("centers a .500 baseline with a zero tick", () => {
    const layout = buildRaceLayout(entries, "matchup");
    const zero = layout.ticks.find((t) => t.value === 0)!;
    expect(zero.label).toBe(".500");
    expect(zero.y).toBe(layout.zeroY);
  });

  it("skips gap weeks without a phantom column", () => {
    const withGap = [...entries, entry({ week: 4, team_key: "a", wins: 8, losses: 0 })];
    const layout = buildRaceLayout(withGap, "matchup");
    expect(layout.weeks).toEqual([1, 2, 4]);
    const a = layout.series.find((s) => s.team_key === "a")!;
    expect(a.points[2].x).toBe(xForWeekIndex(2));
  });

  it("sizes width from week count", () => {
    const layout = buildRaceLayout(entries, "matchup");
    expect(layout.width).toBe(PAD_X + 2 * STEP_X + LABEL_W);
  });

  it("returns an empty layout (still with a .500 tick) for no entries", () => {
    const layout = buildRaceLayout([], "matchup");
    expect(layout.series).toEqual([]);
    expect(layout.weeks).toEqual([]);
    expect(layout.ticks.some((t) => t.value === 0)).toBe(true);
  });
});

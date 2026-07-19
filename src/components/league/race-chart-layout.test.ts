import { describe, expect, it } from "vitest";
import type { StandingsHistoryEntry } from "../../api/types";
import {
  PAD_X, PAD_Y, ROW_H, STEP_X, LABEL_W,
  buildRaceLayout, xForWeekIndex, yForRank,
} from "./race-chart-layout";

function entry(over: Partial<StandingsHistoryEntry>): StandingsHistoryEntry {
  return {
    season: 2026, week: 1, team_key: "t1", team_name: "Team 1", manager: "M1",
    franchise_id: "franchise_1", rank: 1, wins: 0, losses: 0, ties: 0,
    cat_wins: 0, cat_losses: 0, cat_ties: 0, ...over,
  };
}

describe("coordinate formulas", () => {
  it("pins the coordinate formulas to concrete pixels", () => {
    expect(xForWeekIndex(0)).toBe(60);   // PAD_X 36 + 0*48 + 24
    expect(xForWeekIndex(1)).toBe(108);  // PAD_X 36 + 1*48 + 24
    expect(yForRank(1)).toBe(37);        // PAD_Y 24 + 0*26 + 13
    expect(yForRank(2)).toBe(63);        // PAD_Y 24 + 1*26 + 13
  });
});

describe("buildRaceLayout", () => {
  const entries = [
    entry({ week: 1, team_key: "a", rank: 2 }),
    entry({ week: 1, team_key: "b", team_name: "Team B", rank: 1 }),
    entry({ week: 2, team_key: "a", rank: 1 }),
    entry({ week: 2, team_key: "b", team_name: "Team B", rank: 2 }),
  ];

  it("builds one series per team, sorted by final rank", () => {
    const layout = buildRaceLayout(entries);
    expect(layout.series.map((s) => s.team_key)).toEqual(["a", "b"]);
    expect(layout.series[0].final.rank).toBe(1);
  });

  it("orders points by week and maps ranks onto the y grid", () => {
    const a = buildRaceLayout(entries).series[0];
    expect(a.points.map((p) => p.week)).toEqual([1, 2]);
    expect(a.points[0].y).toBe(yForRank(2));
    expect(a.points[1].y).toBe(yForRank(1));
    expect(a.points[0].x).toBe(xForWeekIndex(0));
  });

  it("skips gap weeks without breaking the series", () => {
    const withGap = [...entries, entry({ week: 4, team_key: "a", rank: 1 })];
    const layout = buildRaceLayout(withGap);
    expect(layout.weeks).toEqual([1, 2, 4]);
    const a = layout.series.find((s) => s.team_key === "a")!;
    expect(a.points.map((p) => p.week)).toEqual([1, 2, 4]);
    expect(a.points[2].x).toBe(xForWeekIndex(2)); // index-based, no phantom week 3 column
  });

  it("sizes the canvas from week count and team count", () => {
    const layout = buildRaceLayout(entries);
    expect(layout.width).toBe(PAD_X + 2 * STEP_X + LABEL_W);
    expect(layout.height).toBeGreaterThanOrEqual(PAD_Y + 2 * ROW_H);
  });

  it("returns an empty layout for no entries", () => {
    const layout = buildRaceLayout([]);
    expect(layout.series).toEqual([]);
    expect(layout.weeks).toEqual([]);
  });
});

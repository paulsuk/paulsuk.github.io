import { describe, expect, it } from "vitest";
import type { PlayoffMatchup, PlayoffRound } from "../../api/types";
import {
  MATCH_H,
  assembleBracket,
  center,
  eightTeamLayout,
  inferByeSeeds,
  sixTeamLayout,
} from "./playoff-bracket-layout";

function matchup(over: Partial<PlayoffMatchup>): PlayoffMatchup {
  return {
    team_1_name: "T1",
    team_1_manager: "M1",
    team_1_seed: 1,
    team_2_name: "T2",
    team_2_manager: "M2",
    team_2_seed: 2,
    cats_won_1: 0,
    cats_won_2: 0,
    is_tied: false,
    winner: null,
    ...over,
  } as PlayoffMatchup;
}

function round(week: number, label: string, matchups: PlayoffMatchup[], consolation: PlayoffMatchup[] = []): PlayoffRound {
  return { week, round_label: label, matchups, consolation };
}

describe("layout geometry", () => {
  it("eight-team semis sit centered between their quarter feeders (±0.5px rounding)", () => {
    const l = eightTeamLayout();
    const qCenters = l.qTops.map((t) => center(t, MATCH_H));
    expect(Math.abs(center(l.sTops[0], MATCH_H) - (qCenters[0] + qCenters[1]) / 2)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(center(l.sTops[1], MATCH_H) - (qCenters[2] + qCenters[3]) / 2)).toBeLessThanOrEqual(0.5);
  });

  it("connector outputs land on the next round's box centers (both shapes)", () => {
    for (const l of [eightTeamLayout(), sixTeamLayout()]) {
      expect(l.qsLines[0].output_y).toBe(center(l.sTops[0], MATCH_H));
      expect(l.qsLines[1].output_y).toBe(center(l.sTops[1], MATCH_H));
      expect(l.sfLines[0].output_y).toBe(center(l.fTop, MATCH_H));
    }
  });

  it("totalHeight contains every column (both shapes)", () => {
    const eight = eightTeamLayout();
    expect(eight.totalHeight).toBeGreaterThanOrEqual(eight.qTops[3] + MATCH_H);
    expect(eight.totalHeight).toBeGreaterThanOrEqual(eight.f3Top + MATCH_H);
    const six = sixTeamLayout();
    expect(six.totalHeight).toBeGreaterThanOrEqual(six.qTop2 + MATCH_H);
    expect(six.totalHeight).toBeGreaterThanOrEqual(six.f3Top + MATCH_H);
  });
});

describe("assembleBracket", () => {
  // 2026 basketball shape: QF -> SF -> Finals, 8-seed champion is representable.
  const qf = round(21, "Quarterfinals", [
    matchup({ team_1_name: "A", team_1_seed: 1, team_2_name: "H", team_2_seed: 8, winner: "H", cats_won_1: 3, cats_won_2: 6 }),
    matchup({ team_1_name: "D", team_1_seed: 4, team_2_name: "E", team_2_seed: 5, winner: "D", cats_won_1: 5, cats_won_2: 4 }),
    matchup({ team_1_name: "B", team_1_seed: 2, team_2_name: "G", team_2_seed: 7, winner: "B", cats_won_1: 7, cats_won_2: 2 }),
    matchup({ team_1_name: "C", team_1_seed: 3, team_2_name: "F", team_2_seed: 6, winner: "C", cats_won_1: 6, cats_won_2: 3 }),
  ]);
  const sf = round(22, "Semifinals", [
    matchup({ team_1_name: "H", team_1_seed: 8, team_2_name: "D", team_2_seed: 4, winner: "H", cats_won_1: 5, cats_won_2: 4 }),
    matchup({ team_1_name: "B", team_1_seed: 2, team_2_name: "C", team_2_seed: 3, winner: "B", cats_won_1: 6, cats_won_2: 3 }),
  ]);
  const finals = round(23, "Finals",
    [matchup({ team_1_name: "H", team_1_seed: 8, team_2_name: "B", team_2_seed: 2, winner: "H", cats_won_1: 5, cats_won_2: 4 })],
    [
      matchup({ team_1_name: "D", team_1_seed: 4, team_2_name: "C", team_2_seed: 3, winner: "C" }),
      matchup({ team_1_name: "E", team_1_seed: 5, team_2_name: "F", team_2_seed: 6, winner: "E" }),
    ]);

  it("wires QF -> SF -> Finals with an 8-seed champion", () => {
    const b = assembleBracket([qf, sf, finals])!;
    expect(b.isSixTeam).toBe(false);
    expect(b.qMatchups.map(topSeedName)).toEqual(["A", "B", "C", "D"]);
    expect(b.championship?.winner).toBe("H");
    expect(b.qLabel).toBe("Quarterfinals — Wk 21");
  });

  it("third place = the consolation game between the two semi losers", () => {
    const b = assembleBracket([qf, sf, finals])!;
    expect(b.thirdPlace).not.toBeNull();
    expect([b.thirdPlace!.team_1_name, b.thirdPlace!.team_2_name].sort()).toEqual(["C", "D"]);
  });

  it("no third place until both semis are decided", () => {
    const undecidedSf = round(22, "Semifinals", [
      matchup({ team_1_name: "H", team_2_name: "D", winner: null }),
      matchup({ team_1_name: "B", team_2_name: "C", winner: "B" }),
    ]);
    const b = assembleBracket([qf, undecidedSf, finals])!;
    expect(b.thirdPlace).toBeNull();
  });

  it("six-team bracket: bye seeds are semi teams that skipped round 1", () => {
    const mlbQf = round(20, "Quarterfinals", [
      matchup({ team_1_name: "C3", team_1_seed: 3, team_2_name: "C6", team_2_seed: 6, winner: "C3" }),
      matchup({ team_1_name: "C4", team_1_seed: 4, team_2_name: "C5", team_2_seed: 5, winner: "C4" }),
    ]);
    const mlbSf = round(21, "Semifinals", [
      matchup({ team_1_name: "C1", team_1_seed: 1, team_2_name: "C4", team_2_seed: 4 }),
      matchup({ team_1_name: "C2", team_1_seed: 2, team_2_name: "C3", team_2_seed: 3 }),
    ]);
    const b = assembleBracket([mlbQf, mlbSf])!;
    expect(b.isSixTeam).toBe(true);
    expect(b.byeSeeds).toEqual([1, 2]);
    expect(inferByeSeeds(b.qMatchups, b.sMatchups)).toEqual([1, 2]);
  });

  it("returns null when no round has matchups", () => {
    expect(assembleBracket([round(20, "Quarterfinals", [])])).toBeNull();
  });
});

function topSeedName(m: PlayoffMatchup): string {
  return (m.team_1_seed ?? 99) <= (m.team_2_seed ?? 99) ? m.team_1_name : m.team_2_name;
}

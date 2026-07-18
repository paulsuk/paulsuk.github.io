// Pure playoff-bracket assembly + pixel-layout math (no JSX — unit-testable).
import type { PlayoffMatchup, PlayoffRound } from "../../api/types";

// ── Layout constants ────────────────────────────────────────────────────────
export const ROW_H = 28;
export const MATCH_H = ROW_H * 2 + 1; // 57px (two rows + 1px divider)
export const BYE_H = ROW_H;           // 28px
export const GAP_INNER = 16;          // between matchups in same half
export const GAP_OUTER = 48;          // between bracket halves
export const CONN_W = 24;             // SVG connector column width
export const COL_W = 176;             // matchup box width
export const HEADER_H = 24;           // ColHeader height (text-xs 16px + mb-2 8px)
export const LABEL_H = 14;            // small label above finals boxes

export interface ConnectorLine {
  from_y: number;
  to_y: number;
  output_y: number;
}

// ── Position helpers ────────────────────────────────────────────────────────

export function center(top: number, height: number) {
  return top + height / 2;
}

export function midpoint(a: number, b: number) {
  return (a + b) / 2;
}

export function topSeed(m: PlayoffMatchup): number {
  return Math.min(m.team_1_seed ?? 99, m.team_2_seed ?? 99);
}

// ── Shared semis + finals geometry ──────────────────────────────────────────
// Both bracket shapes position semis between their two feeder centers and the
// finals between the semi centers — one implementation, fed different pairs.

function semisAndFinals(
  feederPairs: [[number, number], [number, number]],
  round1Height: number,
) {
  const sTops = [
    Math.round(midpoint(feederPairs[0][0], feederPairs[0][1]) - MATCH_H / 2),
    Math.round(midpoint(feederPairs[1][0], feederPairs[1][1]) - MATCH_H / 2),
  ];
  const sCenters = sTops.map((t) => center(t, MATCH_H));

  // LABEL_H offset leaves room for the "Championship" label above the box
  const fTop = Math.round(midpoint(sCenters[0], sCenters[1]) - MATCH_H / 2) + LABEL_H;
  const f3Top = fTop + MATCH_H + GAP_OUTER + LABEL_H;

  const totalHeight = Math.max(round1Height, sTops[1] + MATCH_H, f3Top + MATCH_H);

  const qsLines: ConnectorLine[] = [
    { from_y: feederPairs[0][0], to_y: feederPairs[0][1], output_y: sCenters[0] },
    { from_y: feederPairs[1][0], to_y: feederPairs[1][1], output_y: sCenters[1] },
  ];
  const sfLines: ConnectorLine[] = [
    { from_y: sCenters[0], to_y: sCenters[1], output_y: center(fTop, MATCH_H) },
  ];

  return { sTops, fTop, f3Top, totalHeight, qsLines, sfLines };
}

// ── 8-team bracket (4 round-1 matchups) ─────────────────────────────────────

export function eightTeamLayout() {
  const qTops = [
    0,
    MATCH_H + GAP_INNER,
    MATCH_H * 2 + GAP_INNER + GAP_OUTER,
    MATCH_H * 3 + GAP_INNER * 2 + GAP_OUTER,
  ];
  const qCenters = qTops.map((t) => center(t, MATCH_H));

  return {
    qTops,
    ...semisAndFinals(
      [[qCenters[0], qCenters[1]], [qCenters[2], qCenters[3]]],
      qTops[3] + MATCH_H,
    ),
  };
}

// ── 6-team bracket (2 round-1 matchups + 2 byes) ────────────────────────────

export function sixTeamLayout() {
  const byeTop1 = 0;
  const qTop1 = BYE_H + GAP_INNER;
  const byeTop2 = qTop1 + MATCH_H + GAP_OUTER;
  const qTop2 = byeTop2 + BYE_H + GAP_INNER;

  return {
    byeTop1,
    qTop1,
    byeTop2,
    qTop2,
    ...semisAndFinals(
      [
        [center(byeTop1, BYE_H), center(qTop1, MATCH_H)],
        [center(byeTop2, BYE_H), center(qTop2, MATCH_H)],
      ],
      qTop2 + MATCH_H,
    ),
  };
}

// ── Bracket assembly (rounds → sorted matchups, byes, finals, labels) ───────

export function inferByeSeeds(
  qMatchups: PlayoffMatchup[],
  sMatchups: PlayoffMatchup[],
): (number | null)[] {
  // Byes: seeds present in the semis that never played a round-1 matchup.
  const quarterSeeds = new Set(qMatchups.flatMap((m) => [m.team_1_seed, m.team_2_seed]));
  const semiSeeds = new Set(sMatchups.flatMap((m) => [m.team_1_seed, m.team_2_seed]));
  return [...semiSeeds]
    .filter((s) => !quarterSeeds.has(s))
    .sort((a, b) => (a ?? 99) - (b ?? 99));
}

export function assembleBracket(rounds: PlayoffRound[]) {
  const bracketRounds = rounds.filter((r) => r.matchups.length > 0);
  if (bracketRounds.length === 0) return null;

  const quartersRound = bracketRounds[0];
  const semisRound = bracketRounds[1] ?? null;
  const finalsRound = bracketRounds[2] ?? null;

  const qMatchups = [...quartersRound.matchups].sort((a, b) => topSeed(a) - topSeed(b));
  const sMatchups = semisRound
    ? [...semisRound.matchups].sort((a, b) => topSeed(a) - topSeed(b))
    : [];

  const finalsMatchups = finalsRound
    ? [...finalsRound.matchups].sort((a, b) => topSeed(a) - topSeed(b))
    : [];
  const championship = finalsMatchups[0] ?? null;

  // 3rd place: the consolation matchup whose teams are the losers of the two
  // semis (consolation may hold 5th-8th place games too — match by names).
  const semiLosers = sMatchups
    .filter((m) => m.winner !== null && !m.is_tied)
    .map((m) => (m.winner === m.team_1_name ? m.team_2_name : m.team_1_name));
  const thirdPlace =
    semiLosers.length === 2
      ? (finalsRound?.consolation.find(
          (m) =>
            semiLosers.includes(m.team_1_name) &&
            semiLosers.includes(m.team_2_name),
        ) ?? null)
      : null;

  const byeSeeds = inferByeSeeds(qMatchups, sMatchups);

  return {
    // Bracket shape is data-derived, never a sport/slug branch: 2 round-1
    // matchups (+2 byes) is the six-team format, 4 is the eight-team format.
    isSixTeam: qMatchups.length === 2,
    qMatchups,
    sMatchups,
    championship,
    thirdPlace,
    byeSeeds,
    qLabel: `${quartersRound.round_label} — Wk ${quartersRound.week}`,
    sLabel: semisRound ? `${semisRound.round_label} — Wk ${semisRound.week}` : "Semifinals",
    fLabel: finalsRound ? `${finalsRound.round_label} — Wk ${finalsRound.week}` : "Finals",
  };
}

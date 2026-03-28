import type { PlayoffMatchup, PlayoffRound } from "../../api/types";
import Card from "../shared/Card";

// ── Layout constants ────────────────────────────────────────────────────────
const ROW_H = 28;
const MATCH_H = ROW_H * 2 + 1; // 57px (two rows + 1px divider)
const BYE_H = ROW_H;            // 28px
const GAP_INNER = 16;           // between matchups in same half
const GAP_OUTER = 48;           // between bracket halves
const CONN_W = 24;              // SVG connector column width
const COL_W = 176;              // matchup box width
const HEADER_H = 24;            // ColHeader height (text-xs 16px + mb-2 8px)
const LABEL_H = 14;             // small label above finals boxes

interface PlayoffBracketProps {
  rounds: PlayoffRound[];
  totalRounds: number;
  slug: string;
}

interface ConnectorLine {
  from_y: number;
  to_y: number;
  output_y: number;
}

// ── Position helpers ─────────────────────────────────────────────────────────

function center(top: number, height: number) {
  return top + height / 2;
}

function midpoint(a: number, b: number) {
  return (a + b) / 2;
}

function topSeed(m: PlayoffMatchup): number {
  return Math.min(m.team_1_seed ?? 99, m.team_2_seed ?? 99);
}

// ── 8-team bracket layout (basketball) ──────────────────────────────────────

function eightTeamLayout() {
  const qTops = [
    0,
    MATCH_H + GAP_INNER,
    MATCH_H * 2 + GAP_INNER + GAP_OUTER,
    MATCH_H * 3 + GAP_INNER * 2 + GAP_OUTER,
  ];
  const qCenters = qTops.map(t => center(t, MATCH_H));

  const sTops = [
    Math.round(midpoint(qCenters[0], qCenters[1]) - MATCH_H / 2),
    Math.round(midpoint(qCenters[2], qCenters[3]) - MATCH_H / 2),
  ];
  const sCenters = sTops.map(t => center(t, MATCH_H));

  // Add LABEL_H offset so there's room for the "Championship" label above the box
  const fTop = Math.round(midpoint(sCenters[0], sCenters[1]) - MATCH_H / 2) + LABEL_H;
  const f3Top = fTop + MATCH_H + GAP_OUTER + LABEL_H;

  const qHeight = qTops[3] + MATCH_H;
  const sHeight = sTops[1] + MATCH_H;
  const fHeight = f3Top + MATCH_H;
  const totalHeight = Math.max(qHeight, sHeight, fHeight);

  const qsLines: ConnectorLine[] = [
    { from_y: qCenters[0], to_y: qCenters[1], output_y: sCenters[0] },
    { from_y: qCenters[2], to_y: qCenters[3], output_y: sCenters[1] },
  ];
  const sfLines: ConnectorLine[] = [
    { from_y: sCenters[0], to_y: sCenters[1], output_y: center(fTop, MATCH_H) },
  ];

  return { qTops, sTops, fTop, f3Top, totalHeight, qsLines, sfLines };
}

// ── 6-team bracket layout (baseball) ─────────────────────────────────────────

function sixTeamLayout() {
  const byeTop1 = 0;
  const qTop1 = BYE_H + GAP_INNER;
  const byeTop2 = qTop1 + MATCH_H + GAP_OUTER;
  const qTop2 = byeTop2 + BYE_H + GAP_INNER;

  const byeCenter1 = center(byeTop1, BYE_H);
  const qCenter1 = center(qTop1, MATCH_H);
  const byeCenter2 = center(byeTop2, BYE_H);
  const qCenter2 = center(qTop2, MATCH_H);

  const sTops = [
    Math.round(midpoint(byeCenter1, qCenter1) - MATCH_H / 2),
    Math.round(midpoint(byeCenter2, qCenter2) - MATCH_H / 2),
  ];
  const sCenters = sTops.map(t => center(t, MATCH_H));

  const fTop = Math.round(midpoint(sCenters[0], sCenters[1]) - MATCH_H / 2) + LABEL_H;
  const f3Top = fTop + MATCH_H + GAP_OUTER + LABEL_H;

  const qHeight = qTop2 + MATCH_H;
  const sHeight = sTops[1] + MATCH_H;
  const fHeight = f3Top + MATCH_H;
  const totalHeight = Math.max(qHeight, sHeight, fHeight);

  const qsLines: ConnectorLine[] = [
    { from_y: byeCenter1, to_y: qCenter1, output_y: sCenters[0] },
    { from_y: byeCenter2, to_y: qCenter2, output_y: sCenters[1] },
  ];
  const sfLines: ConnectorLine[] = [
    { from_y: sCenters[0], to_y: sCenters[1], output_y: center(fTop, MATCH_H) },
  ];

  return { byeTop1, qTop1, byeTop2, qTop2, sTops, fTop, f3Top, totalHeight, qsLines, sfLines };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PlayoffBracket({ rounds, slug }: PlayoffBracketProps) {
  if (rounds.length === 0) return null;

  const isBaseball = slug === "baseball";
  const bracketRounds = rounds.filter(r => r.matchups.length > 0);
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

  // 3rd place: find the consolation matchup whose teams are the losers of the two semis.
  // consolation may contain multiple games (5th-8th place etc.) so match by team names.
  const semiLosers = sMatchups
    .filter(m => m.winner !== null && !m.is_tied)
    .map(m => (m.winner === m.team_1_name ? m.team_2_name : m.team_1_name));
  const thirdPlace =
    semiLosers.length === 2
      ? (finalsRound?.consolation.find(
          m =>
            semiLosers.includes(m.team_1_name) &&
            semiLosers.includes(m.team_2_name)
        ) ?? null)
      : null;

  const qLabel = quartersRound.round_label + ` — Wk ${quartersRound.week}`;
  const sLabel = semisRound ? semisRound.round_label + ` — Wk ${semisRound.week}` : "Semifinals";
  const fLabel = finalsRound ? finalsRound.round_label + ` — Wk ${finalsRound.week}` : "Finals";

  if (isBaseball) {
    const layout = sixTeamLayout();
    const { byeTop1, qTop1, byeTop2, qTop2, sTops, fTop, f3Top, totalHeight, qsLines, sfLines } = layout;

    const qm1 = qMatchups[0] ?? null;
    const qm2 = qMatchups[1] ?? null;

    // Byes: seeds in semis that don't appear in quarters
    const quarterSeeds = new Set(qMatchups.flatMap(m => [m.team_1_seed, m.team_2_seed]));
    const semiSeeds = new Set(sMatchups.flatMap(m => [m.team_1_seed, m.team_2_seed]));
    const byeSeeds = [...semiSeeds].filter(s => !quarterSeeds.has(s)).sort((a, b) => (a ?? 99) - (b ?? 99));
    const byeSeed1 = byeSeeds[0] ?? null;
    const byeSeed2 = byeSeeds[1] ?? null;

    const sm1 = sMatchups[0] ?? null;
    const sm2 = sMatchups[1] ?? null;

    return (
      <Card title="Playoff Bracket">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-start" style={{ minWidth: (COL_W + CONN_W) * 3 + COL_W }}>
            <div className="flex flex-col">
              <ColHeader label={qLabel} />
              <div className="relative" style={{ width: COL_W, height: totalHeight }}>
                <ByeSlot top={byeTop1} seed={byeSeed1} />
                {qm1 ? <MatchupBox matchup={qm1} top={qTop1} /> : <TbdBox top={qTop1} />}
                <ByeSlot top={byeTop2} seed={byeSeed2} />
                {qm2 ? <MatchupBox matchup={qm2} top={qTop2} /> : <TbdBox top={qTop2} />}
              </div>
            </div>

            <ConnectorWrapper height={totalHeight} lines={qsLines} />

            <div className="flex flex-col">
              <ColHeader label={sLabel} />
              <div className="relative" style={{ width: COL_W, height: totalHeight }}>
                {sm1 ? <MatchupBox matchup={sm1} top={sTops[0]} /> : <TbdBox top={sTops[0]} />}
                {sm2 ? <MatchupBox matchup={sm2} top={sTops[1]} /> : <TbdBox top={sTops[1]} />}
              </div>
            </div>

            <ConnectorWrapper height={totalHeight} lines={sfLines} />

            <div className="flex flex-col">
              <ColHeader label={fLabel} />
              <div className="relative" style={{ width: COL_W, height: totalHeight }}>
                <FinalsLabel top={fTop} text="Championship" />
                {championship ? <MatchupBox matchup={championship} top={fTop} placement="championship" /> : <TbdBox top={fTop} />}
                <FinalsLabel top={f3Top} text="3rd Place" />
                {thirdPlace ? <MatchupBox matchup={thirdPlace} top={f3Top} placement="third" /> : <TbdBox top={f3Top} />}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // 8-team basketball
  const layout = eightTeamLayout();
  const { qTops, sTops, fTop, f3Top, totalHeight, qsLines, sfLines } = layout;

  const sm1 = sMatchups[0] ?? null;
  const sm2 = sMatchups[1] ?? null;

  return (
    <Card title="Playoff Bracket">
      <div className="overflow-x-auto pb-2">
        <div className="flex items-start" style={{ minWidth: (COL_W + CONN_W) * 3 + COL_W }}>
          <div className="flex flex-col">
            <ColHeader label={qLabel} />
            <div className="relative" style={{ width: COL_W, height: totalHeight }}>
              {qMatchups.map((m, i) => (
                <MatchupBox key={i} matchup={m} top={qTops[i] ?? 0} />
              ))}
            </div>
          </div>

          <ConnectorWrapper height={totalHeight} lines={qsLines} />

          <div className="flex flex-col">
            <ColHeader label={sLabel} />
            <div className="relative" style={{ width: COL_W, height: totalHeight }}>
              {sm1 ? <MatchupBox matchup={sm1} top={sTops[0]} /> : <TbdBox top={sTops[0]} />}
              {sm2 ? <MatchupBox matchup={sm2} top={sTops[1]} /> : <TbdBox top={sTops[1]} />}
            </div>
          </div>

          <ConnectorWrapper height={totalHeight} lines={sfLines} />

          <div className="flex flex-col">
            <ColHeader label={fLabel} />
            <div className="relative" style={{ width: COL_W, height: totalHeight }}>
              <FinalsLabel top={fTop} text="Championship" />
              {championship ? <MatchupBox matchup={championship} top={fTop} placement="championship" /> : <TbdBox top={fTop} />}
              <FinalsLabel top={f3Top} text="3rd Place" />
              {thirdPlace ? <MatchupBox matchup={thirdPlace} top={f3Top} placement="third" /> : <TbdBox top={f3Top} />}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ColHeader({ label }: { label: string }) {
  return (
    <div
      className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 text-center whitespace-nowrap overflow-hidden"
      style={{ width: COL_W, height: HEADER_H - 8 /* text height only; mb-2 provides the 8px gap */ }}
    >
      {label}
    </div>
  );
}

function FinalsLabel({ top, text }: { top: number; text: string }) {
  return (
    <div
      className="absolute text-[10px] text-gray-400 px-1"
      style={{ top: top - LABEL_H }}
    >
      {text}
    </div>
  );
}

function ByeSlot({ top, seed }: { top: number; seed: number | null }) {
  return (
    <div
      className="absolute flex items-center px-3 border border-dashed border-gray-200 rounded text-xs italic text-gray-400"
      style={{ top, width: COL_W, height: BYE_H }}
    >
      {seed != null && <span className="text-gray-300 mr-2 w-4 text-right">{seed}</span>}
      bye
    </div>
  );
}

function TbdBox({ top }: { top: number }) {
  return (
    <div
      className="absolute rounded border border-dashed border-gray-200 bg-white flex items-center justify-center"
      style={{ top, width: COL_W, height: MATCH_H }}
    >
      <span className="text-xs text-gray-300 italic">TBD</span>
    </div>
  );
}

function MatchupBox({
  matchup: m,
  top,
  placement,
}: {
  matchup: PlayoffMatchup;
  top: number;
  placement?: "championship" | "third";
}) {
  const isComplete = m.winner !== null && !m.is_tied;
  const inProgress = !isComplete && (m.cats_won_1 > 0 || m.cats_won_2 > 0);
  const t1Won = m.winner === m.team_1_name;
  const t2Won = m.winner === m.team_2_name;

  let borderClass = "border-dashed border-gray-200";
  if (isComplete) borderClass = "border-gray-200";
  if (inProgress) borderClass = "border-amber-400";

  const t1Medal =
    placement === "championship" && t1Won ? "🥇" :
    placement === "championship" && t2Won && isComplete ? "🥈" :
    placement === "third" && t1Won ? "🥉" :
    undefined;
  const t2Medal =
    placement === "championship" && t2Won ? "🥇" :
    placement === "championship" && t1Won && isComplete ? "🥈" :
    placement === "third" && t2Won ? "🥉" :
    undefined;

  return (
    <div
      className={`absolute rounded border ${borderClass} bg-white overflow-hidden`}
      style={{ top, width: COL_W, height: MATCH_H }}
    >
      <TeamRow
        name={m.team_1_name}
        seed={m.team_1_seed}
        score={m.cats_won_1}
        isWinner={t1Won}
        isLoser={t2Won && isComplete}
        showScore={isComplete || inProgress}
        medal={t1Medal}
      />
      <div className="border-t border-gray-100" />
      <TeamRow
        name={m.team_2_name}
        seed={m.team_2_seed}
        score={m.cats_won_2}
        isWinner={t2Won}
        isLoser={t1Won && isComplete}
        showScore={isComplete || inProgress}
        medal={t2Medal}
      />
      {isComplete && (
        <div
          className="absolute left-0 w-0.5 rounded-l bg-green-500"
          style={{ top: t1Won ? 0 : ROW_H + 1, height: ROW_H }}
        />
      )}
    </div>
  );
}

function TeamRow({
  name,
  seed,
  score,
  isWinner,
  isLoser,
  showScore,
  medal,
}: {
  name: string;
  seed: number | null;
  score: number;
  isWinner: boolean;
  isLoser: boolean;
  showScore: boolean;
  medal?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between px-2 ${isWinner ? "font-semibold" : ""}`}
      style={{ height: ROW_H }}
    >
      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
        {medal && <span className="text-xs flex-shrink-0">{medal}</span>}
        {seed != null && (
          <span className="text-[10px] text-gray-400 w-4 text-right flex-shrink-0">{seed}</span>
        )}
        <span
          className={`text-xs truncate ${isWinner ? "text-gray-900" : isLoser ? "text-gray-400" : "text-gray-600"}`}
        >
          {name}
        </span>
      </div>
      {showScore && (
        <span className={`text-xs tabular-nums flex-shrink-0 ml-1 ${isWinner ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
          {score}
        </span>
      )}
    </div>
  );
}

// ── SVG connector (wrapped with header spacer so y-coords match box tops) ────

function ConnectorWrapper({ height, lines }: { height: number; lines: ConnectorLine[] }) {
  const mid = CONN_W / 2;
  return (
    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ height: HEADER_H }} />
      <svg width={CONN_W} height={height} style={{ overflow: "visible" }}>
        {lines.map((l, i) => (
          <g key={i} stroke="#d1d5db" strokeWidth={1} fill="none">
            <line x1={0} y1={l.from_y} x2={mid} y2={l.from_y} />
            <line x1={0} y1={l.to_y} x2={mid} y2={l.to_y} />
            <line x1={mid} y1={l.from_y} x2={mid} y2={l.to_y} />
            <line x1={mid} y1={l.output_y} x2={CONN_W} y2={l.output_y} />
          </g>
        ))}
      </svg>
    </div>
  );
}

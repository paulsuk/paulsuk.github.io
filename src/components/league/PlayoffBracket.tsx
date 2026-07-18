import type { PlayoffMatchup, PlayoffRound } from "../../api/types";
import Card from "../shared/Card";
import {
  BYE_H,
  COL_W,
  CONN_W,
  HEADER_H,
  LABEL_H,
  MATCH_H,
  ROW_H,
  type ConnectorLine,
  assembleBracket,
  eightTeamLayout,
  sixTeamLayout,
} from "./playoff-bracket-layout";

interface PlayoffBracketProps {
  rounds: PlayoffRound[];
}

export default function PlayoffBracket({ rounds }: PlayoffBracketProps) {
  const bracket = assembleBracket(rounds);
  if (!bracket) return null;

  const {
    isSixTeam, qMatchups, sMatchups, championship, thirdPlace,
    byeSeeds, qLabel, sLabel, fLabel,
  } = bracket;

  const layout = isSixTeam ? sixTeamLayout() : eightTeamLayout();
  const { sTops, fTop, f3Top, totalHeight, qsLines, sfLines } = layout;

  const sm1 = sMatchups[0] ?? null;
  const sm2 = sMatchups[1] ?? null;

  return (
    <Card title="Playoff Bracket">
      <div className="overflow-x-auto pb-2">
        <div className="flex items-start" style={{ minWidth: (COL_W + CONN_W) * 3 + COL_W }}>
          <div className="flex flex-col">
            <ColHeader label={qLabel} />
            <div className="relative" style={{ width: COL_W, height: totalHeight }}>
              {isSixTeam && "byeTop1" in layout ? (
                <>
                  <ByeSlot top={layout.byeTop1} seed={byeSeeds[0] ?? null} />
                  {qMatchups[0]
                    ? <MatchupBox matchup={qMatchups[0]} top={layout.qTop1} />
                    : <TbdBox top={layout.qTop1} />}
                  <ByeSlot top={layout.byeTop2} seed={byeSeeds[1] ?? null} />
                  {qMatchups[1]
                    ? <MatchupBox matchup={qMatchups[1]} top={layout.qTop2} />
                    : <TbdBox top={layout.qTop2} />}
                </>
              ) : (
                "qTops" in layout &&
                qMatchups.map((m, i) => (
                  <MatchupBox key={i} matchup={m} top={layout.qTops[i] ?? 0} />
                ))
              )}
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
      className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2 text-center whitespace-nowrap overflow-hidden"
      style={{ width: COL_W, height: HEADER_H - 8 /* text height only; mb-2 provides the 8px gap */ }}
    >
      {label}
    </div>
  );
}

function FinalsLabel({ top, text }: { top: number; text: string }) {
  return (
    <div
      className="absolute text-[10px] text-ink-faint px-1"
      style={{ top: top - LABEL_H }}
    >
      {text}
    </div>
  );
}

function ByeSlot({ top, seed }: { top: number; seed: number | null }) {
  return (
    <div
      className="absolute flex items-center px-3 border border-dashed border-rule rounded text-xs italic text-ink-faint"
      style={{ top, width: COL_W, height: BYE_H }}
    >
      {seed != null && <span className="text-ink-faint mr-2 w-4 text-right">{seed}</span>}
      bye
    </div>
  );
}

function TbdBox({ top }: { top: number }) {
  return (
    <div
      className="absolute rounded border border-dashed border-rule bg-raised flex items-center justify-center"
      style={{ top, width: COL_W, height: MATCH_H }}
    >
      <span className="text-xs text-ink-faint italic">TBD</span>
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

  let borderClass = "border-dashed border-rule";
  if (isComplete) borderClass = "border-rule";
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
      className={`absolute rounded border ${borderClass} bg-raised overflow-hidden`}
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
      <div className="border-t border-rule" />
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
          <span className="text-[10px] text-ink-faint w-4 text-right flex-shrink-0">{seed}</span>
        )}
        <span
          className={`text-xs truncate ${isWinner ? "text-ink" : isLoser ? "text-ink-faint" : "text-ink-soft"}`}
        >
          {name}
        </span>
      </div>
      {showScore && (
        <span className={`text-xs tabular-nums flex-shrink-0 ml-1 ${isWinner ? "text-ink font-semibold" : "text-ink-faint"}`}>
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
          <g key={i} stroke="var(--color-rule)" strokeWidth={1} fill="none">
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

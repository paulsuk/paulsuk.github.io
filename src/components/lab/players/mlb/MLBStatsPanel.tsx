import { fmtCompact } from "../../../../utils/format";
const BATTER_COLS = ["HR", "R", "RBI", "SB", "AVG", "OBP", "SLG", "OPS", "BB%", "K%", "WAR"];
const PITCHER_COLS = ["W", "SV", "ERA", "WHIP", "K", "IP", "K%", "BB%", "FIP", "WAR"];

export default function MLBStatsPanel({ stats, isPitcher }: { stats: Record<string, number | null>; isPitcher: boolean }) {
  const cols = (isPitcher ? PITCHER_COLS : BATTER_COLS).filter((c) => c in stats);

  if (!cols.length) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-ink-soft mb-2">
        {isPitcher ? "Pitching Stats" : "Batting Stats"}
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {cols.map((c) => (
          <div key={c} className="bg-paper rounded p-2 text-center">
            <div className="text-xs text-ink-faint mb-0.5">{c}</div>
            <div className="text-sm font-medium tabular-nums">
              {stats[c] != null ? fmtCompact(stats[c] as number) : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

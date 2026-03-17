const BATTER_COLS = ["HR", "R", "RBI", "SB", "AVG", "OBP", "SLG", "OPS", "BB%", "K%", "WAR"];
const PITCHER_COLS = ["W", "SV", "ERA", "WHIP", "K", "IP", "K%", "BB%", "FIP", "WAR"];

export default function MLBStatsPanel({ stats }: { stats: Record<string, number | null> }) {
  const isPitcher = "ERA" in stats && !("HR" in stats);
  const cols = (isPitcher ? PITCHER_COLS : BATTER_COLS).filter((c) => c in stats);

  if (!cols.length) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        {isPitcher ? "Pitching Stats" : "Batting Stats"}
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {cols.map((c) => (
          <div key={c} className="bg-gray-50 rounded p-2 text-center">
            <div className="text-xs text-gray-400 mb-0.5">{c}</div>
            <div className="text-sm font-medium tabular-nums">
              {stats[c] != null ? (stats[c] as number).toFixed(3).replace(/\.?0+$/, "") : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

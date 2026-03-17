const NBA_COLS = ["PTS", "REB", "AST", "ST", "BLK", "FG%", "FT%", "3PTM", "GP"];

export default function NBAStatsPanel({ stats }: { stats: Record<string, number | null> }) {
  const cols = NBA_COLS.filter((c) => c in stats);
  if (!cols.length) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Per Game Stats</h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {cols.map((c) => (
          <div key={c} className="bg-gray-50 rounded p-2 text-center">
            <div className="text-xs text-gray-400 mb-0.5">{c}</div>
            <div className="text-sm font-medium tabular-nums">
              {stats[c] != null ? (stats[c] as number).toFixed(1) : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

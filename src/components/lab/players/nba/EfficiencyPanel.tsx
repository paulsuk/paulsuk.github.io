function derive(stats: Record<string, number | null>) {
  const pts = stats["PTS"] ?? 0;
  const fga = stats["FGA"] ?? 0;
  const fta = stats["FTA"] ?? 0;
  const min = stats["MIN"] ?? 0;

  const ts = (fga + 0.44 * fta) > 0
    ? pts / (2 * (fga + 0.44 * fta))
    : null;

  const per36 = (col: number | null) =>
    min > 0 && col != null ? (col / min) * 36 : null;

  return {
    "TS%": ts,
    "USG%": stats["USG%"] ?? null,
    "PTS/36": per36(stats["PTS"] ?? null),
    "REB/36": per36(stats["REB"] ?? null),
    "AST/36": per36(stats["AST"] ?? null),
  };
}

export default function EfficiencyPanel({ stats }: { stats: Record<string, number | null> }) {
  const derived = derive(stats);
  const cols = Object.entries(derived).filter(([, v]) => v != null) as [string, number][];
  if (!cols.length) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Efficiency</h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {cols.map(([label, val]) => (
          <div key={label} className="bg-gray-50 rounded p-2 text-center">
            <div className="text-xs text-gray-400 mb-0.5">{label}</div>
            <div className="text-sm font-medium tabular-nums">
              {val.toFixed(3).replace(/\.?0+$/, "")}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
        Advanced metrics (RAPM / EPM) — coming soon
      </div>
    </div>
  );
}

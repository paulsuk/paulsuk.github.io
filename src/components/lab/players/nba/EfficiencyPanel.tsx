import { fmtCompact } from "../../../../utils/format";
import StatTileGrid from "../../../shared/StatTileGrid";
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
  const tiles = (Object.entries(derived).filter(([, v]) => v != null) as [string, number][])
    .map(([label, val]) => ({ label, value: fmtCompact(val) }));

  return (
    <StatTileGrid title="Efficiency" gridClassName="grid grid-cols-3 sm:grid-cols-5 gap-2" tiles={tiles}>
      <div className="mt-3 rounded border border-dashed border-rule p-3 text-center text-xs text-ink-faint">
        Advanced metrics (RAPM / EPM) — coming soon
      </div>
    </StatTileGrid>
  );
}

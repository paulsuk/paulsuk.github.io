import type { Trade } from "../../api/types";

export default function TradeCard({ trade }: { trade: Trade }) {
  // Group players by direction
  const byDest = new Map<string, string[]>();
  for (const p of trade.players) {
    const key = `${p.source_team} \u2192 ${p.dest_team}`;
    const list = byDest.get(key) ?? [];
    list.push(p.name);
    byDest.set(key, list);
  }

  return (
    <div className="item-card">
      <div className="text-label mb-1">
        {trade.season} &middot; Week {trade.week ?? "?"}
      </div>
      {Array.from(byDest.entries()).map(([direction, players]) => (
        <div key={direction} className="text-sm">
          <span className="text-gray-400">{direction}:</span>{" "}
          <span className="font-medium text-gray-700">{players.join(", ")}</span>
        </div>
      ))}
    </div>
  );
}

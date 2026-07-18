import React, { useState } from "react";
import type { RosterTableProps } from "../../../api/types";
import { fmtTiered, signed } from "../../../utils/format";
import ValueRangeBar from "./ValueRangeBar";

function fmtStat(v: number | null | undefined): string {
  return fmtTiered(v, 0);
}

/** Roster table with expandable per-player rows (CI bar + category scores). */
export default function RosterTable({ players, statCols }: RosterTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!players.length) {
    return <p className="text-meta">No players.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-rule">
      <table className="w-full text-sm whitespace-nowrap">
        <thead className="bg-paper">
          <tr>
            <th className="table-header px-3 py-2 text-left">Name</th>
            <th className="table-header px-3 py-2 text-left">Pos</th>
            <th className="table-header px-3 py-2 text-right text-blue-600">
              P-Score
            </th>
            {statCols.map((c) => (
              <th key={c} className="table-header px-2 py-2 text-right">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-rule/60">
          {players.map((player) => {
            const isExpanded = expandedId === player.player_id;
            const scoreEntries = Object.entries(player.category_scores).sort(
              ([, a], [, b]) => b - a
            );
            return (
              <React.Fragment key={player.player_id}>
                <tr
                  onClick={() =>
                    setExpandedId((prev) =>
                      prev === player.player_id ? null : player.player_id
                    )
                  }
                  className="cursor-pointer hover:bg-paper"
                >
                  <td className="px-3 py-2 font-medium text-ink">
                    {player.name}
                  </td>
                  <td className="px-3 py-2 text-ink-soft">
                    {player.positions ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-blue-700 font-semibold">
                    {player.value != null ? player.value.toFixed(2) : "—"}
                  </td>
                  {statCols.map((c) => (
                    <td
                      key={c}
                      className="px-2 py-2 text-right tabular-nums text-ink-soft"
                    >
                      {fmtStat(player.stats[c])}
                    </td>
                  ))}
                </tr>
                {isExpanded && (
                  <tr key={`${player.player_id}-expand`}>
                    <td
                      colSpan={3 + statCols.length}
                      className="px-4 py-2 bg-paper text-xs text-ink-soft border-b border-rule"
                    >
                      <div className="flex items-start gap-6 flex-wrap">
                        {player.value_low != null && player.value_high != null && player.value != null && (
                          <div>
                            <div className="text-ink-faint mb-1">90% range</div>
                            <ValueRangeBar
                              value={player.value}
                              low={player.value_low}
                              high={player.value_high}
                            />
                          </div>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {scoreEntries.length > 0 ? (
                            scoreEntries.map(([cat, score]) => (
                              <span
                                key={cat}
                                className={score >= 0 ? "text-green-700" : "text-red-600"}
                              >
                                {cat} {signed(score)}
                              </span>
                            ))
                          ) : (
                            <span className="text-ink-faint">No score data</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

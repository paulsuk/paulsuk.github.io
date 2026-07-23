import React, { useState } from "react";
import type { RosterTableProps } from "../../../api/types";
import { formatStat, signed } from "../../../utils/format";
import ValueRangeBar from "./ValueRangeBar";

/** Roster table with expandable per-player rows (CI bar + category scores). */
export default function RosterTable({ players, statCols }: RosterTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!players.length) {
    return <p className="text-meta">No players.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-rule">
      <table className="table-dense whitespace-nowrap">
        <thead className="bg-paper">
          <tr>
            <th className="table-header th-dense text-left">Name</th>
            <th className="table-header th-dense text-left">Pos</th>
            <th className="table-header th-dense text-right text-tool">
              P-Score
            </th>
            {statCols.map((c) => (
              <th key={c} className="table-header th-dense text-right">
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
                  <td className="td-dense font-medium text-ink">
                    {player.name}
                  </td>
                  <td className="td-dense text-ink-soft">
                    {player.positions ?? "—"}
                  </td>
                  <td className="td-dense text-right cell-num font-semibold text-tool">
                    {player.value != null ? player.value.toFixed(2) : "—"}
                  </td>
                  {statCols.map((c) => (
                    <td
                      key={c}
                      className="td-dense text-right cell-num text-ink-soft"
                    >
                      {player.stats[c] != null ? formatStat(player.stats[c] as number, c) : "—"}
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
                                className={score >= 0 ? "text-win" : "text-loss"}
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

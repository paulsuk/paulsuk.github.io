import type { SeasonHistoryRow } from "../../../api/types";
import { formatStat } from "../../../utils/format";

export default function SeasonHistory({ rows }: { rows: SeasonHistoryRow[] }) {
  if (!rows.length) return null;
  const cols = rows.length > 0 ? Object.keys(rows[0].stats).slice(0, 10) : [];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-ink-soft mb-2">Season History</h3>
      <div className="overflow-x-auto rounded border border-rule">
        <table className="table-dense">
          <thead className="bg-paper">
            <tr>
              <th className="table-header th-dense text-left">Season</th>
              {cols.map((c) => (
                <th key={c} className="table-header th-dense">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/60">
            {rows.map((row) => (
              <tr key={row.season}>
                <td className="td-dense font-medium text-ink-soft">{row.season}</td>
                {cols.map((c) => (
                  <td key={c} className="td-dense cell-num text-ink-soft text-right">
                    {row.stats[c] != null
                      ? formatStat(row.stats[c] as number, c)
                      : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

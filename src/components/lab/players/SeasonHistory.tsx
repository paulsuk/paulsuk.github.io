import type { SeasonHistoryRow } from "../../../api/types";

export default function SeasonHistory({ rows }: { rows: SeasonHistoryRow[] }) {
  if (!rows.length) return null;
  const cols = rows.length > 0 ? Object.keys(rows[0].stats).slice(0, 10) : [];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Season History</h3>
      <div className="overflow-x-auto rounded border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header px-3 py-2 text-left">Season</th>
              {cols.map((c) => (
                <th key={c} className="table-header px-3 py-2">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.season}>
                <td className="px-3 py-2 font-medium text-gray-700">{row.season}</td>
                {cols.map((c) => (
                  <td key={c} className="px-3 py-2 tabular-nums text-gray-600 text-right">
                    {row.stats[c] != null
                      ? (row.stats[c] as number).toFixed(3).replace(/\.?0+$/, "")
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

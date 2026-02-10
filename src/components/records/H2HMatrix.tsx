import type { ManagerSummary, H2HRecord } from "../../api/types";

interface H2HMatrixProps {
  managers: ManagerSummary[];
  h2h: Record<string, Record<string, H2HRecord>>;
}

export default function H2HMatrix({ managers, h2h }: H2HMatrixProps) {
  // Only show managers who have played at least one H2H matchup
  const activeGuids = new Set(Object.keys(h2h));
  const active = managers.filter((m) => activeGuids.has(m.guid));

  if (active.length === 0) {
    return <p className="text-sm text-gray-400">No head-to-head data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white p-1 text-left font-medium text-gray-600" />
            {active.map((m) => (
              <th key={m.guid} className="p-1 text-center font-medium text-gray-600">
                <div className="w-14 truncate" title={m.name}>
                  {shortName(m.name)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {active.map((row) => (
            <tr key={row.guid}>
              <td className="sticky left-0 bg-white p-1 pr-2 font-medium text-gray-700 whitespace-nowrap">
                {shortName(row.name)}
              </td>
              {active.map((col) => {
                if (row.guid === col.guid) {
                  return (
                    <td key={col.guid} className="p-1 text-center">
                      <div className="h-8 w-14 rounded bg-gray-100" />
                    </td>
                  );
                }

                const record = h2h[row.guid]?.[col.guid];
                if (!record) {
                  return (
                    <td key={col.guid} className="p-1 text-center text-gray-300">—</td>
                  );
                }

                const total = record.wins + record.losses + record.ties;
                const winPct = total > 0 ? record.wins / total : 0.5;
                const bg = cellColor(winPct);

                return (
                  <td key={col.guid} className="p-1 text-center">
                    <div
                      className={`flex h-8 w-14 items-center justify-center rounded text-[10px] font-medium ${bg}`}
                      title={`${row.name} vs ${col.name}: ${record.wins}-${record.losses}${record.ties > 0 ? `-${record.ties}` : ""}`}
                    >
                      {record.wins}-{record.losses}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function shortName(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) return parts[0];
  return name;
}

function cellColor(winPct: number): string {
  if (winPct >= 0.7) return "bg-green-200 text-green-900";
  if (winPct >= 0.55) return "bg-green-100 text-green-800";
  if (winPct >= 0.45) return "bg-gray-100 text-gray-700";
  if (winPct >= 0.3) return "bg-red-100 text-red-800";
  return "bg-red-200 text-red-900";
}

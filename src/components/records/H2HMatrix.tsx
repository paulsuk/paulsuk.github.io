import { useMemo } from "react";
import type { ManagerSummary, H2HRecord, FranchiseStats } from "../../api/types";
import { winPct } from "../../utils/records-helpers";

interface H2HMatrixProps {
  managers: ManagerSummary[];
  h2h: Record<string, Record<string, H2HRecord>>;
  viewMode: "manager" | "franchise";
  franchiseStats?: FranchiseStats[];
  franchiseH2h?: Record<string, Record<string, H2HRecord>>;
}

export default function H2HMatrix({ managers, h2h, viewMode, franchiseStats, franchiseH2h }: H2HMatrixProps) {
  const { entries, matrix } = useMemo(() => {
    const useFranchiseMode = viewMode === "franchise" && franchiseStats && franchiseH2h;

    if (useFranchiseMode) {
      const activeIds = new Set(Object.keys(franchiseH2h));
      return {
        entries: franchiseStats
          .filter((f) => activeIds.has(f.id))
          .map((f) => ({ id: f.id, name: f.current_team_name })),
        matrix: franchiseH2h,
      };
    }

    const activeGuids = new Set(Object.keys(h2h));
    return {
      entries: managers
        .filter((m) => activeGuids.has(m.guid))
        .map((m) => ({ id: m.guid, name: m.name })),
      matrix: h2h,
    };
  }, [viewMode, managers, h2h, franchiseStats, franchiseH2h]);

  if (entries.length === 0) {
    return <p className="text-sm text-ink-faint">No head-to-head data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-raised p-1 text-left font-medium text-ink-soft" />
            {entries.map((e) => (
              <th key={e.id} className="p-1 text-center font-medium text-ink-soft">
                <div className="w-14 truncate" title={e.name}>
                  {shortName(e.name)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((row) => (
            <tr key={row.id}>
              <td className="sticky left-0 bg-raised p-1 pr-2 font-medium text-ink-soft whitespace-nowrap">
                {shortName(row.name)}
              </td>
              {entries.map((col) => {
                if (row.id === col.id) {
                  return (
                    <td key={col.id} className="p-1 text-center">
                      <div className="h-8 w-14 rounded bg-paper" />
                    </td>
                  );
                }

                const record = matrix[row.id]?.[col.id];
                if (!record) {
                  return (
                    <td key={col.id} className="p-1 text-center text-ink-faint">—</td>
                  );
                }

                // Color and displayed pct use the same ties-as-half weighting
                const total = record.wins + record.losses + record.ties;
                const pctVal = total > 0 ? (record.wins + 0.5 * record.ties) / total : 0.5;
                const pct = winPct(record.wins, record.losses, record.ties);
                const bg = cellColor(pctVal);
                const recStr = `${record.wins}-${record.losses}${record.ties > 0 ? `-${record.ties}` : ""}`;

                return (
                  <td key={col.id} className="p-1 text-center">
                    <div
                      className={`flex h-8 w-14 flex-col items-center justify-center rounded text-[10px] font-medium leading-tight ${bg}`}
                      title={`${row.name} vs ${col.name}: ${recStr} (${pct})`}
                    >
                      <div>{recStr}</div>
                      <div className="opacity-75">{pct}</div>
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

const LEADING_ARTICLES = new Set(["the", "a", "an"]);

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  // Skip a leading article so "The Batmans" → "Batmans" not "The"
  const start = parts.length > 1 && LEADING_ARTICLES.has(parts[0].toLowerCase()) ? 1 : 0;
  const remaining = parts.slice(start);
  // Take up to 2 words from the meaningful portion, cap at 10 chars
  const short = remaining.slice(0, 2).join(" ");
  return short.length > 10 ? short.slice(0, 9) + "…" : short;
}

function cellColor(winPct: number): string {
  if (winPct >= 0.7) return "bg-green-200 text-green-900";
  if (winPct >= 0.55) return "bg-green-100 text-green-800";
  if (winPct >= 0.45) return "bg-paper text-ink-soft";
  if (winPct >= 0.3) return "bg-red-100 text-red-800";
  return "bg-red-200 text-red-900";
}

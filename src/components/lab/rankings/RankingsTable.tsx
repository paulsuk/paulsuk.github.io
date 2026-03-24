// web/src/components/lab/rankings/RankingsTable.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RankingsPlayer } from "../../../api/types";

// Columns to display per sport — must match backend stat keys exactly
const MLB_DISPLAY_COLS = ["R", "HR", "RBI", "SB", "AVG", "OPS", "W", "QS", "ERA", "WHIP", "K/9", "SV+H"];
const NBA_DISPLAY_COLS = ["PTS", "REB", "AST", "STL", "BLK", "TO", "FG%", "FT%", "3PTM"];

const PAGE_SIZE = 50;

interface ThProps {
  label: string;
  col: string;
  sortCol: string;
  sortAsc: boolean;
  onSort: (col: string) => void;
  className?: string;
}

function Th({ label, col, sortCol, sortAsc, onSort, className = "" }: ThProps) {
  const active = sortCol === col;
  return (
    <th
      className={`table-header cursor-pointer px-3 py-2 hover:text-gray-700 whitespace-nowrap ${className}`}
      onClick={() => onSort(col)}
      tabIndex={0}
      role="columnheader"
      aria-sort={active ? (sortAsc ? "ascending" : "descending") : "none"}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSort(col); }}
    >
      {label}
      {active && (
        <span className="ml-1 text-gray-400" aria-hidden="true">
          {sortAsc ? "↑" : "↓"}
        </span>
      )}
    </th>
  );
}

interface Props {
  sport: string;
  players: RankingsPlayer[];
  season: string;
  model: string;
  start?: string;
  end?: string;
  search: string;
}

export default function RankingsTable({ sport, players, search }: Props) {
  const navigate = useNavigate();
  const [sortCol, setSortCol] = useState<string>("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const statCols = sport === "nba" ? NBA_DISPLAY_COLS : MLB_DISPLAY_COLS;

  const filtered = useMemo(() => {
    if (!search) return players;
    const q = search.toLowerCase();
    return players.filter((p) => p.name.toLowerCase().includes(q));
  }, [players, search]);

  const sorted = useMemo(() => {
    setPage(1);
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "rank") cmp = a.rank - b.rank;
      else if (sortCol === "value") cmp = b.value - a.value;
      else if (sortCol === "name") cmp = a.name.localeCompare(b.name);
      else if (sortCol.endsWith("__score")) {
        const key = sortCol.slice(0, -7);
        cmp = (b.category_scores[key] ?? -Infinity) - (a.category_scores[key] ?? -Infinity);
      } else {
        const av = a.stats[sortCol] ?? -Infinity;
        const bv = b.stats[sortCol] ?? -Infinity;
        cmp = (bv as number) - (av as number);
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortAsc]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(col: string) {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(col === "rank"); }
  }

  function fmtStat(v: number | null | undefined): string {
    if (v == null) return "—";
    return v.toFixed(3).replace(/\.?0+$/, "");
  }

  function fmtScore(v: number | undefined): string {
    if (v == null) return "—";
    return v.toFixed(2);
  }

  if (!players.length || !sorted.length) {
    const msg = !players.length ? "No players found." : `No players match "${search}".`;
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
        <p className="text-label">{msg}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-meta mb-2">{sorted.length} players</p>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th label="#" col="rank" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
              <Th label="Name" col="name" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
              <th className="table-header px-3 py-2">Team</th>
              <th className="table-header px-3 py-2">Pos</th>
              <Th label="Value" col="value" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
              {/* Raw stats */}
              {statCols.map((c) => (
                <Th key={c} label={c} col={c} sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
              ))}
              {/* Per-stat model scores — visually separated */}
              <th className="px-3 py-2 border-l-2 border-blue-200" />
              {statCols.map((c) => (
                <Th
                  key={`${c}__score`}
                  label={c}
                  col={`${c}__score`}
                  sortCol={sortCol}
                  sortAsc={sortAsc}
                  onSort={handleSort}
                  className="bg-blue-50 text-blue-700"
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((p, i) => (
              <tr
                key={p.player_id}
                className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} cursor-pointer hover:bg-blue-50/40`}
                onClick={() => navigate(`/lab/players/${sport}/${p.player_id}`)}
              >
                <td className="px-3 py-2 text-gray-400 tabular-nums">{p.rank}</td>
                <td className="px-3 py-2 font-medium text-gray-900">{p.name}</td>
                <td className="px-3 py-2 text-gray-500">{p.team ?? "—"}</td>
                <td className="px-3 py-2 text-gray-500 text-xs">{p.positions ?? "—"}</td>
                <td className="px-3 py-2 stat-value text-blue-700">{p.value.toFixed(2)}</td>
                {statCols.map((c) => (
                  <td key={c} className="px-3 py-2 tabular-nums text-gray-600">
                    {fmtStat(p.stats[c] as number | null)}
                  </td>
                ))}
                {/* Divider cell */}
                <td className="border-l-2 border-blue-200" />
                {statCols.map((c) => (
                  <td key={`${c}__score`} className="px-3 py-2 tabular-nums text-blue-600 bg-blue-50/30">
                    {fmtScore(p.category_scores[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <p className="text-meta">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs text-meta hover:text-primary disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs text-meta hover:text-primary disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

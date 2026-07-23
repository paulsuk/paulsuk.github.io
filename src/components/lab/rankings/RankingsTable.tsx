// web/src/components/lab/rankings/RankingsTable.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RankingsPlayer } from "../../../api/types";
import { formatStat } from "../../../utils/format";
import { CAT_ORDER, NBA_CAT_ORDER } from "../../../utils/lab-helpers";

// Columns to display per sport — must match backend stat keys exactly.
const NBA_DISPLAY_COLS = NBA_CAT_ORDER;
const MLB_DISPLAY_COLS = CAT_ORDER;

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
      className={`table-header cursor-pointer th-dense hover:text-ink whitespace-nowrap ${className}`}
      onClick={() => onSort(col)}
      tabIndex={0}
      role="columnheader"
      aria-sort={active ? (sortAsc ? "ascending" : "descending") : "none"}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSort(col); }}
    >
      {label}
      {active && (
        <span className="ml-1 text-ink-faint" aria-hidden="true">
          {sortAsc ? "↑" : "↓"}
        </span>
      )}
    </th>
  );
}

interface Props {
  sportCode: string;
  slug: string;
  players: RankingsPlayer[];
  search: string;
}

export default function RankingsTable({ sportCode, slug, players, search }: Props) {
  const navigate = useNavigate();
  const [sortCol, setSortCol] = useState<string>("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const statCols = sportCode === "nba" ? NBA_DISPLAY_COLS : MLB_DISPLAY_COLS;

  const filtered = useMemo(() => {
    if (!search) return players;
    const q = search.toLowerCase();
    return players.filter((p) => p.name.toLowerCase().includes(q));
  }, [players, search]);

  // Reset pagination when the visible set changes (never setState in a memo —
  // render-phase setState breaks under StrictMode/concurrent rendering).
  useEffect(() => {
    setPage(1);
  }, [search, sortCol, sortAsc]);

  const sorted = useMemo(() => {
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

  function fmtScore(v: number | undefined): string {
    if (v == null) return "—";
    return v.toFixed(2);
  }

  if (!players.length || !sorted.length) {
    const msg = !players.length ? "No players found." : `No players match "${search}".`;
    return (
      <div className="rounded-lg border border-dashed border-rule p-8 text-center">
        <p className="text-label">{msg}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-meta mb-2">{sorted.length} players</p>
      <div className="overflow-x-auto rounded-lg border border-rule">
        <table className="table-dense">
          <thead className="bg-paper">
            <tr>
              <Th label="#" col="rank" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
              <Th label="Name" col="name" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
              <th className="table-header th-dense">Team</th>
              <th className="table-header th-dense">Pos</th>
              <Th label="P-Score" col="value" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
              {/* Raw stats */}
              {statCols.map((c) => (
                <Th key={c} label={c} col={c} sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
              ))}
              {/* Per-stat model scores — visually separated */}
              <th className="th-dense border-l-2 border-rule" />
              {statCols.map((c) => (
                <Th
                  key={`${c}__score`}
                  label={c}
                  col={`${c}__score`}
                  sortCol={sortCol}
                  sortAsc={sortAsc}
                  onSort={handleSort}
                  className="bg-tool-soft text-tool"
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/60">
            {paginated.map((p, i) => (
              <tr key={p.player_id} className={i % 2 === 0 ? "bg-raised" : "bg-paper/50"}>
                <td className="td-dense text-ink-faint tabular-nums">{p.rank}</td>
                <td className="td-dense">
                  <button
                    onClick={() => navigate(`/lab/${slug}/players/${p.player_id}`)}
                    className="font-medium text-ink hover:text-tool hover:underline text-left"
                  >
                    {p.name}
                  </button>
                </td>
                <td className="td-dense text-ink-soft">{p.team ?? "—"}</td>
                <td className="td-dense text-ink-soft text-xs">{p.positions ?? "—"}</td>
                <td className="td-dense cell-num font-semibold text-tool">{p.value.toFixed(2)}</td>
                {statCols.map((c) => (
                  <td key={c} className="td-dense cell-num text-ink-soft">
                    {p.stats[c] != null ? formatStat(p.stats[c] as number, c) : "—"}
                  </td>
                ))}
                {/* Divider cell */}
                <td className="border-l-2 border-rule" />
                {statCols.map((c) => (
                  <td key={`${c}__score`} className="td-dense score-cell">
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
              className="text-xs text-meta hover:text-ink disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs text-meta hover:text-ink disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// web/src/components/lab/rankings/RankingsTable.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RankingsPlayer } from "../../../api/types";

interface Props {
  sport: string;
  players: RankingsPlayer[];
  season: string;
  model: string;
  start?: string;
  end?: string;
  search: string;
}

export default function RankingsTable({
  sport,
  players,
  season,
  model,
  start,
  end,
  search,
}: Props) {
  const navigate = useNavigate();
  const [sortCol, setSortCol] = useState<string>("rank");
  const [sortAsc, setSortAsc] = useState(true);

  const statCols = useMemo(() => {
    if (!players.length) return [];
    return Object.keys(players[0].stats).slice(0, 10);
  }, [players]);

  const filtered = useMemo(() => {
    if (!search) return players;
    const q = search.toLowerCase();
    return players.filter((p) => p.name.toLowerCase().includes(q));
  }, [players, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "rank") cmp = a.rank - b.rank;
      else if (sortCol === "value") cmp = b.value - a.value;
      else if (sortCol === "name") cmp = a.name.localeCompare(b.name);
      else {
        const av = a.stats[sortCol] ?? -Infinity;
        const bv = b.stats[sortCol] ?? -Infinity;
        cmp = (bv as number) - (av as number);
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortAsc]);

  function handleSort(col: string) {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(col === "rank"); }
  }

  function navigateToPlayer(playerId: number) {
    const params = new URLSearchParams({ season, model });
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    navigate(`/lab/players/${sport}/${playerId}?${params.toString()}`);
  }

  function Th({ label, col }: { label: string; col: string }) {
    const active = sortCol === col;
    return (
      <th
        className="table-header cursor-pointer px-3 py-2 hover:text-gray-700 whitespace-nowrap"
        onClick={() => handleSort(col)}
      >
        {label}
        {active && <span className="ml-1 text-gray-400">{sortAsc ? "↑" : "↓"}</span>}
      </th>
    );
  }

  if (!players.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
        <p className="text-label">No players found.</p>
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
              <Th label="#" col="rank" />
              <Th label="Name" col="name" />
              <th className="table-header px-3 py-2">Team</th>
              <th className="table-header px-3 py-2">Pos</th>
              <Th label="Value" col="value" />
              {statCols.map((c) => (
                <Th key={c} label={c} col={c} />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((p, i) => (
              <tr
                key={p.player_id}
                className={`cursor-pointer hover:bg-blue-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                onClick={() => navigateToPlayer(p.player_id)}
              >
                <td className="px-3 py-2 text-gray-400 tabular-nums">{p.rank}</td>
                <td className="px-3 py-2 font-medium text-gray-900">{p.name}</td>
                <td className="px-3 py-2 text-gray-500">{p.team ?? "—"}</td>
                <td className="px-3 py-2 text-gray-500 text-xs">{p.positions ?? "—"}</td>
                <td className="px-3 py-2 stat-value text-blue-700">
                  {p.value.toFixed(2)}
                </td>
                {statCols.map((c) => (
                  <td key={c} className="px-3 py-2 tabular-nums text-gray-600">
                    {p.stats[c] != null
                      ? (p.stats[c] as number).toFixed(3).replace(/\.?0+$/, "")
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

import { useState } from "react";
import type { LabPlayer } from "../../api/types";

type SortKey = "rank" | "value" | "name";

export default function RankingsTable({
  players,
  sport,
}: {
  players: LabPlayer[];
  sport: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = players.filter((p) =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "rank") cmp = (a.rank ?? 9999) - (b.rank ?? 9999);
    else if (sortKey === "value") cmp = b.value - a.value;
    else cmp = a.name.localeCompare(b.name);
    return sortAsc ? cmp : -cmp;
  });

  // Detect category columns (not base columns)
  const baseCols = new Set(["player_id", "name", "value", "rank", "team", "nba_person_id"]);
  const catCols = players.length
    ? Object.keys(players[0]).filter(
        (k) => !baseCols.has(k) && !k.endsWith("_z") && typeof players[0][k] === "number"
      )
    : [];

  function handleSort(key: SortKey) {
    if (sortKey === key) setSearchAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === "rank"); }
  }

  function setSearchAsc(v: boolean) { setSortAsc(v); }

  function SortTh({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <th
        className="table-header cursor-pointer px-3 py-2 hover:text-gray-700"
        onClick={() => handleSort(k)}
      >
        {label}
        {active && <span className="ml-1 text-gray-400">{sortAsc ? "↑" : "↓"}</span>}
      </th>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <input
          type="search"
          placeholder="Search player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border border-gray-200 px-3 py-1.5 text-sm w-52 shadow-sm"
        />
        <span className="ml-3 text-meta">{sorted.length} players</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <SortTh label="#" k="rank" />
              <SortTh label="Name" k="name" />
              {sport === "mlb" || sport === "nba" ? (
                <th className="table-header px-3 py-2">Team</th>
              ) : null}
              <SortTh label="Value" k="value" />
              {catCols.slice(0, 8).map((c) => (
                <th key={c} className="table-header px-3 py-2">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((p, i) => (
              <tr key={String(p.player_id)} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-3 py-2 text-gray-400 tabular-nums">{p.rank}</td>
                <td className="px-3 py-2 font-medium text-gray-900">{p.name}</td>
                {sport === "mlb" || sport === "nba" ? (
                  <td className="px-3 py-2 text-gray-500">{String(p.team ?? "")}</td>
                ) : null}
                <td className="px-3 py-2 stat-value text-blue-700">
                  {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
                </td>
                {catCols.slice(0, 8).map((c) => (
                  <td key={c} className="px-3 py-2 tabular-nums text-gray-600">
                    {typeof p[c] === "number" ? (p[c] as number).toFixed(3).replace(/\.?0+$/, "") : String(p[c] ?? "")}
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

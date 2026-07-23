import { useState, useMemo } from "react";
import type { DraftPoolPlayer, DraftPlayerSearchProps } from "../../api/types";

export function PlayerSearch({ players, onSelect, placeholder = "Search players..." }: DraftPlayerSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return players.filter((p: DraftPoolPlayer) => p.name.toLowerCase().includes(q)).slice(0, 15);
  }, [query, players]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border border-rule rounded text-sm"
      />
      {filtered.length > 0 && (
        <ul className="absolute z-20 w-full bg-raised border border-rule rounded shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((p: DraftPoolPlayer) => (
            <li
              key={p.player_id}
              className="p-2 hover:bg-tool-soft cursor-pointer text-sm flex justify-between"
              onClick={() => { onSelect(p.player_id); setQuery(""); }}
            >
              <span>{p.name}</span>
              <span className="text-ink-soft">{String(p.eligible_positions || "")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

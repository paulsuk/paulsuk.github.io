import { useState, useMemo } from "react";

interface Player {
  player_id: number;
  name: string;
  [key: string]: unknown;
}

interface Props {
  players: Player[];
  onSelect: (playerId: number) => void;
  placeholder?: string;
}

export function PlayerSearch({ players, onSelect, placeholder = "Search players..." }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return players.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 15);
  }, [query, players]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border rounded text-sm"
      />
      {filtered.length > 0 && (
        <ul className="absolute z-20 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((p) => (
            <li
              key={p.player_id}
              className="p-2 hover:bg-blue-50 cursor-pointer text-sm flex justify-between"
              onClick={() => { onSelect(p.player_id); setQuery(""); }}
            >
              <span>{p.name}</span>
              <span className="text-gray-500">{String(p.eligible_positions || "")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

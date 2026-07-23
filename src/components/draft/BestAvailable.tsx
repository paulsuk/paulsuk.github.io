import { useState, useMemo } from "react";
import { PlayerSearch } from "./PlayerSearch";
import type { DraftCandidate } from "../../api/types";
import { MLB_POSITION_FILTERS } from "../../utils/lab-helpers";

interface Props {
  candidates: DraftCandidate[];
  onPick: (playerId: number) => void;
  disabled?: boolean;
}

const POSITIONS = MLB_POSITION_FILTERS;

export function BestAvailable({ candidates, onPick, disabled }: Props) {
  const [posFilter, setPosFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"hscore" | "gscore">("hscore");

  const filtered = useMemo(() => {
    if (posFilter === "All") return candidates;
    return candidates.filter((c) =>
      String(c.eligible_positions || "").split(",").some((p) => p.trim() === posFilter)
    );
  }, [candidates, posFilter]);

  const sorted = useMemo(() => {
    if (sortBy === "hscore") return filtered; // already sorted by API
    return [...filtered].sort((a, b) => (b.gscore ?? 0) - (a.gscore ?? 0));
  }, [filtered, sortBy]);

  return (
    <div className="flex flex-col h-full">
      <PlayerSearch
        players={candidates}
        onSelect={onPick}
        placeholder="Search & pick a player..."
      />

      <div className="flex items-center justify-between my-2">
        <div className="flex gap-1 flex-wrap">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setPosFilter(pos)}
              className={`px-2 py-0.5 text-xs rounded ${
                posFilter === pos ? "bg-ink text-paper" : "bg-paper"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
        <div className="flex gap-1 shrink-0 ml-2">
          <button
            aria-label="Sort by H-score"
            onClick={() => setSortBy("hscore")}
            className={`px-2 py-0.5 text-xs rounded ${
              sortBy === "hscore" ? "bg-ink text-paper" : "bg-paper"
            }`}
          >
            H
          </button>
          <button
            aria-label="Sort by P-Score"
            onClick={() => setSortBy("gscore")}
            className={`px-2 py-0.5 text-xs rounded ${
              sortBy === "gscore" ? "bg-ink text-paper" : "bg-paper"
            }`}
          >
            G
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-raised">
            <tr className="text-left text-xs text-ink-soft">
              <th className="p-1">#</th>
              <th className="p-1">Player</th>
              <th className="p-1">Pos</th>
              <th className="p-1 text-right">H</th>
              <th className="p-1 text-right">G</th>
              <th className="p-1"></th>
            </tr>
          </thead>
          <tbody>
            {/* slice(0, 100) is a render cap; sorted always contains the full filtered population */}
            {sorted.slice(0, 100).map((c, i) => (
              <tr key={c.player_id} className="hover:bg-tool-soft border-b border-rule">
                <td className="p-1 text-ink-faint">{i + 1}</td>
                <td className="p-1 font-medium">{c.name}</td>
                <td className="p-1 text-xs text-ink-soft">{c.eligible_positions}</td>
                <td className={`p-1 text-right font-mono text-xs ${sortBy === "hscore" ? "font-bold" : "text-ink-soft"}`}>
                  {c.hscore.toFixed(2)}
                </td>
                <td className={`p-1 text-right font-mono text-xs ${sortBy === "gscore" ? "font-bold" : "text-ink-soft"}`}>
                  {c.gscore != null ? c.gscore.toFixed(2) : "—"}
                </td>
                <td className="p-1">
                  <button
                    onClick={() => onPick(c.player_id)}
                    disabled={disabled}
                    className={`text-xs px-2 py-0.5 rounded ${
                      disabled
                        ? "bg-rule text-ink-faint cursor-not-allowed"
                        : "bg-tool text-paper hover:bg-tool/90"
                    }`}
                  >
                    Pick
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

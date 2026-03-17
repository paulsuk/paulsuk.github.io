import { useMemo, useState } from "react";

// TODO(Task 10): this component will be deleted — local stub until then
interface LabPlayer { player_id: string | number; name: string; value: number; rank: number; team?: string; [key: string]: unknown; }

export default function DraftHelper({
  players,
  sport: _sport,
}: {
  players: LabPlayer[];
  sport: string;
}) {
  const [drafted, setDrafted] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const playerKey = (p: LabPlayer) => String(p.player_id);

  const remaining = useMemo(
    () => players.filter((p) => !drafted.has(playerKey(p))),
    [players, drafted],
  );
  const draftedList = useMemo(
    () => players.filter((p) => drafted.has(playerKey(p))),
    [players, drafted],
  );
  const filtered = useMemo(
    () => remaining.filter((p) =>
      search ? p.name.toLowerCase().includes(search.toLowerCase()) : true
    ),
    [remaining, search],
  );

  function draft(p: LabPlayer) {
    setDrafted((prev) => new Set([...prev, playerKey(p)]));
    setSearch("");
  }

  function undraft(p: LabPlayer) {
    setDrafted((prev) => {
      const next = new Set(prev);
      next.delete(playerKey(p));
      return next;
    });
  }

  function reset() {
    setDrafted(new Set());
    setSearch("");
  }

  return (
    <div className="flex gap-6">
      {/* Available players */}
      <div className="flex-1 min-w-0">
        <div className="mb-3 flex items-center gap-3">
          <input
            type="search"
            placeholder="Search available..."
            aria-label="Search available players"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded border border-gray-200 px-3 py-1.5 text-sm w-52 shadow-sm"
            autoFocus
          />
          <span className="text-meta">{remaining.length} remaining</span>
        </div>

        <div className="rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header px-3 py-2">#</th>
                <th className="table-header px-3 py-2">Name</th>
                <th className="table-header px-3 py-2">Value</th>
                <th className="table-header px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.slice(0, 80).map((p) => (
                <tr key={playerKey(p)} className="hover:bg-blue-50/40">
                  <td className="px-3 py-1.5 text-gray-400 tabular-nums">{p.rank}</td>
                  <td className="px-3 py-1.5 font-medium text-gray-900">{p.name}</td>
                  <td className="px-3 py-1.5 stat-value text-blue-700">
                    {p.value.toFixed(2)}
                  </td>
                  <td className="px-3 py-1.5">
                    <button
                      onClick={() => draft(p)}
                      className="rounded px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                    >
                      Draft
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drafted sidebar */}
      <div className="w-56 flex-shrink-0">
        <div className="mb-3 flex items-center justify-between">
          <span className="section-label">Drafted ({draftedList.length})</span>
          {draftedList.length > 0 && (
            <button
              onClick={reset}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-1">
          {draftedList.map((p) => (
            <div
              key={playerKey(p)}
              className="flex items-center justify-between rounded-md bg-gray-50 px-2 py-1 text-sm"
            >
              <span className="text-gray-700 truncate">{p.name}</span>
              <button
                onClick={() => undraft(p)}
                className="ml-2 flex-shrink-0 text-xs text-gray-400 hover:text-red-500"
                title="Remove"
                aria-label={`Remove ${p.name}`}
              >
                &times;
              </button>
            </div>
          ))}
          {!draftedList.length && (
            <p className="text-meta">Click "Draft" to add players here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

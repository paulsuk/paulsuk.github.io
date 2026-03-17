import { useState } from "react";
import RankingsTable from "./RankingsTable";
import DraftHelper from "./DraftHelper";
import ReplacementPanel from "./ReplacementPanel";

// TODO(Task 10): this component will be deleted — local stubs until then
interface LabRun { model: string; sport: string; season: string; run_id: string; timestamp: string; num_players: number; data_desc: string; notes?: string | null; }
type LabPlayer = { player_id: string | number; name: string; value: number; rank: number; team?: string; [key: string]: unknown; }
function useLabRuns() { return { data: null as LabRun[] | null, loading: false, error: null }; }
function useLabPlayers(_m: string | null, _sp: string | null, _se: string | null) { return { data: null as LabPlayer[] | null, loading: false }; }

type Tab = "rankings" | "draft" | "replacement";

function RunSelector({
  runs,
  selected,
  onSelect,
}: {
  runs: LabRun[];
  selected: LabRun | null;
  onSelect: (run: LabRun) => void;
}) {
  if (!runs.length) return <p className="text-label">No published rankings yet.</p>;

  return (
    <div className="flex items-center gap-3">
      <span className="text-label">Rankings:</span>
      <select
        className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-800 shadow-sm"
        value={selected ? `${selected.model}/${selected.sport}/${selected.season}` : ""}
        onChange={(e) => {
          const found = runs.find(
            (r) => `${r.model}/${r.sport}/${r.season}` === e.target.value
          );
          if (found) onSelect(found);
        }}
      >
        <option value="">— select a run —</option>
        {runs.map((r) => (
          <option key={`${r.model}/${r.sport}/${r.season}`} value={`${r.model}/${r.sport}/${r.season}`}>
            {r.model} / {r.sport.toUpperCase()} / {r.season}
            {r.notes ? ` (${r.notes})` : ""}
          </option>
        ))}
      </select>
      {selected && (
        <span className="text-meta">
          {selected.num_players} players &middot; {selected.timestamp.slice(0, 10)}
        </span>
      )}
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "rankings", label: "Rankings" },
  { id: "draft", label: "Draft Helper" },
  { id: "replacement", label: "Replacement Level" },
];

export default function LabPage() {
  const { data: runs, loading: runsLoading, error: runsError } = useLabRuns();
  const [selectedRun, setSelectedRun] = useState<LabRun | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("rankings");

  const { data: players, loading: playersLoading } = useLabPlayers(
    selectedRun?.model ?? null,
    selectedRun?.sport ?? null,
    selectedRun?.season ?? null
  );

  if (runsLoading) return <p className="text-label">Loading...</p>;
  if (runsError) return <p className="text-red-600 text-sm">{runsError}</p>;

  const runList = runs ?? [];

  return (
    <div>
      <div className="mb-6">
        <RunSelector
          runs={runList}
          selected={selectedRun}
          onSelect={setSelectedRun}
        />
      </div>

      {!selectedRun && (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
          <p className="text-label">Select a ranking set above to get started.</p>
        </div>
      )}

      {selectedRun && (
        <>
          <div className="tab-bar">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`tab-btn ${activeTab === t.id ? "tab-btn-active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {playersLoading && <p className="text-label">Loading players...</p>}

          {!playersLoading && players && (
            <>
              {activeTab === "rankings" && (
                <RankingsTable players={players} sport={selectedRun.sport} />
              )}
              {activeTab === "draft" && (
                <DraftHelper players={players} sport={selectedRun.sport} />
              )}
              {activeTab === "replacement" && (
                <ReplacementPanel players={players} sport={selectedRun.sport} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

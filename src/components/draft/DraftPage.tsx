import { useEffect, useState } from "react";
import { DraftGrid } from "./DraftGrid";
import { BestAvailable } from "./BestAvailable";
import { TeamProfile } from "./TeamProfile";
import { useDraftSession } from "./useDraftSession";
import { fetchApi } from "../../api/client";
import type { DraftCandidate } from "../../api/types";

interface TeamProfileResponse {
  recommendations: DraftCandidate[];
  team_profile: {
    category_totals: Record<string, number>;
    category_ranks: Record<string, number>;
    category_tiers: Record<string, string>;
  };
}

export function DraftPage() {
  const { session, grid, loading, error, logPick, undoPick, refreshGrid, connectSession } = useDraftSession();
  const [candidates, setCandidates] = useState<DraftCandidate[]>([]);
  const [playerNames, setPlayerNames] = useState<Record<number, string>>({});
  const [teams, setTeams] = useState<string[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<{ name: string; total: number; rank: number; tier: string }[]>([]);

  const [sessionId, setSessionId] = useState("");

  // Load recommendations and grid whenever session updates
  useEffect(() => {
    if (!session) return;
    refreshGrid();
    loadRecommendations();
  }, [session?.session_id, session?.picks_made]);

  // Extract teams + player name map from grid
  useEffect(() => {
    if (grid.length === 0) return;
    const teamSet = new Set<string>();
    const names: Record<number, string> = { ...playerNames };
    for (const pick of grid) {
      teamSet.add(pick.team_id);
    }
    setTeams(Array.from(teamSet));
    // Merge any new names from candidates
    for (const c of candidates) {
      if (c.player_id) names[c.player_id] = c.name;
    }
    setPlayerNames(names);
  }, [grid, candidates]);

  async function loadRecommendations() {
    if (!session) return;
    try {
      const data = await fetchApi<TeamProfileResponse>(
        `/api/draft/sessions/${session.session_id}/recommendations?limit=50`
      );
      const recs = data.recommendations.map((r) => ({
        ...r,
        hscore: Number(r.hscore ?? r.h_score ?? 0),
      }));
      setCandidates(recs);

      // Build category info for TeamProfile
      const profile = data.team_profile;
      const cats = Object.keys(profile.category_totals).map((name) => ({
        name,
        total: profile.category_totals[name] ?? 0,
        rank: profile.category_ranks[name] ?? 5,
        tier: profile.category_tiers[name] ?? "swing",
      }));
      setCategoryInfo(cats);

      // Update player name map
      const names: Record<number, string> = { ...playerNames };
      for (const r of recs) {
        if (r.player_id && r.name) names[r.player_id] = r.name;
      }
      setPlayerNames(names);
    } catch {
      // Recommendations may not be available yet
    }
  }

  const handleConnect = async () => {
    if (!sessionId.trim()) return;
    await connectSession(sessionId.trim());
  };

  if (!session) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Draft Board</h1>
        <p className="text-gray-600 mb-4">
          Connect to a draft session (create one via the API first):
        </p>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 text-sm rounded mb-4">{error}</div>
        )}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            placeholder="Session ID (e.g. a1b2c3d4)"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "..." : "Connect"}
          </button>
        </div>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`# Create session via API first:
POST /api/draft/sessions
{
  "league_slug": "baseball",
  "season": 2026,
  "my_team_id": "...",
  "draft_order": [...],
  "keepers": [...]
}
# Then enter the returned session_id above`}
        </pre>
      </div>
    );
  }

  const handlePick = async (playerId: number) => {
    await logPick(playerId);
  };

  return (
    <div className="h-screen flex flex-col">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 text-sm">{error}</div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Draft Grid */}
        <div className="w-2/3 p-2 overflow-auto border-r">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">
              Draft Board — Pick {session.current_pick?.pick_number || "Done"}
            </h2>
            <button
              onClick={undoPick}
              className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Undo
            </button>
          </div>
          <DraftGrid
            grid={grid}
            teams={teams}
            playerNames={playerNames}
            numRounds={24}
          />
        </div>

        {/* Right: Best Available */}
        <div className="w-1/3 p-2 flex flex-col">
          <h2 className="text-lg font-bold mb-2">Best Available</h2>
          <BestAvailable candidates={candidates} onPick={handlePick} />
        </div>
      </div>

      {/* Bottom: Team Profile */}
      <div className="h-48 border-t p-2 overflow-auto">
        <h3 className="text-sm font-bold mb-1">Team Category Profile</h3>
        <TeamProfile categories={categoryInfo} />
      </div>
    </div>
  );
}

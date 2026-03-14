import { useEffect, useState, useCallback } from "react";
import { DraftGrid } from "./DraftGrid";
import { BestAvailable } from "./BestAvailable";
import { TeamProfile } from "./TeamProfile";
import { useDraftSession } from "./useDraftSession";
import { API_URL } from "../../api/client";
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
  const { session, grid, loading, error, logPick, undoPick, refreshGrid, connectSession, createSession } = useDraftSession();
  const [candidates, setCandidates] = useState<DraftCandidate[]>([]);
  const [playerNames, setPlayerNames] = useState<Record<number, string>>({});
  const [teams, setTeams] = useState<string[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<{ name: string; total: number; rank: number; tier: string }[]>([]);

  const [sessionId, setSessionId] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [createSlug, setCreateSlug] = useState("baseball");
  const [createSeason, setCreateSeason] = useState(new Date().getFullYear());
  const [createTeamId, setCreateTeamId] = useState("");

  const loadRecommendations = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(
        `${API_URL}/api/draft/sessions/${session.session_id}/recommendations?limit=50`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as TeamProfileResponse;
      const recs = (data.recommendations ?? []).map((r) => ({
        ...r,
        hscore: Number((r as Record<string, unknown>).hscore ?? (r as Record<string, unknown>).h_score ?? 0),
      }));
      setCandidates(recs);
      const profile = data.team_profile;
      const cats = Object.keys(profile.category_totals).map((name) => ({
        name,
        total: profile.category_totals[name] ?? 0,
        rank: profile.category_ranks[name] ?? 5,
        tier: profile.category_tiers[name] ?? "swing",
      }));
      setCategoryInfo(cats);
      // Functional updater avoids stale closure overwriting concurrent updates
      setPlayerNames((prev) => {
        const next = { ...prev };
        for (const r of recs) {
          if (r.player_id && r.name) next[r.player_id] = r.name;
        }
        return next;
      });
    } catch (e) {
      console.error("Failed to load recommendations:", e);
    }
  }, [session]);

  // Load recommendations and grid whenever session updates
  useEffect(() => {
    if (!session) return;
    refreshGrid();
    loadRecommendations();
  }, [session?.session_id, session?.picks_made, refreshGrid, loadRecommendations]);

  // Extract teams from grid
  useEffect(() => {
    if (grid.length === 0) return;
    const teamSet = new Set<string>();
    for (const pick of grid) teamSet.add(pick.team_id);
    setTeams(Array.from(teamSet));
  }, [grid]);

  // Merge candidate names into playerNames map
  useEffect(() => {
    setPlayerNames((prev) => {
      const next = { ...prev };
      for (const c of candidates) {
        if (c.player_id) next[c.player_id] = c.name;
      }
      return next;
    });
  }, [candidates]);

  const handleConnect = async () => {
    if (!sessionId.trim()) return;
    await connectSession(sessionId.trim());
  };

  const handleCreate = async () => {
    if (!createTeamId.trim()) return;
    await createSession({
      league_slug: createSlug,
      season: createSeason,
      my_team_id: createTeamId.trim(),
      draft_order: [],
      keepers: [],
    });
  };

  if (!session) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Draft Board</h1>

        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setCreateMode(false)}
            className={`px-4 py-2 text-sm font-medium ${!createMode ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Connect
          </button>
          <button
            onClick={() => setCreateMode(true)}
            className={`px-4 py-2 text-sm font-medium ${createMode ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            New Session
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 text-sm rounded mb-4">{error}</div>
        )}

        {!createMode ? (
          <div>
            <p className="text-gray-500 text-sm mb-3">Enter an existing session ID:</p>
            <div className="flex gap-2">
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
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">Create a new draft session:</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">League</label>
                <select
                  value={createSlug}
                  onChange={(e) => setCreateSlug(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="baseball">Baseball</option>
                  <option value="basketball">Basketball</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Season</label>
                <input
                  type="number"
                  value={createSeason}
                  onChange={(e) => setCreateSeason(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">My Team ID</label>
              <input
                type="text"
                value={createTeamId}
                onChange={(e) => setCreateTeamId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. 458.l.25845.t.3"
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={loading || !createTeamId.trim()}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Session"}
            </button>
          </div>
        )}
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

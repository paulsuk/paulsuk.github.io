import { useEffect, useState, useCallback } from "react";
import { DraftGrid } from "./DraftGrid";
import { BestAvailable } from "./BestAvailable";
import { TeamProfile } from "./TeamProfile";
import { useDraftSession } from "./useDraftSession";
import { API_URL } from "../../api/client";
import type { DraftCandidate, DraftPreload } from "../../api/types";

const SESSION_STORAGE_KEY = "draft_session_id";

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
  const [teamNames, setTeamNames] = useState<Record<string, string>>({});
  const [categoryInfo, setCategoryInfo] = useState<{ name: string; total: number; rank: number; tier: string }[]>([]);
  const [recError, setRecError] = useState<string | null>(null);

  // Preload state
  const [preload, setPreload] = useState<DraftPreload | null>(null);
  const [preloadLoading, setPreloadLoading] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const [myTeamKey, setMyTeamKey] = useState("");

  // Load preload data on mount
  useEffect(() => {
    const fetchPreload = async () => {
      setPreloadLoading(true);
      setPreloadError(null);
      try {
        const res = await fetch(`${API_URL}/api/draft/preload/baseball`);
        if (!res.ok) throw new Error(await res.text());
        const data: DraftPreload = await res.json();
        setPreload(data);
        // Build team name map for grid headers
        const nameMap: Record<string, string> = {};
        for (const t of data.teams) nameMap[t.team_key] = t.name;
        setTeamNames(nameMap);
        // Pre-populate keeper player names
        setPlayerNames((prev) => {
          const next = { ...prev };
          for (const k of data.keepers) {
            if (k.player_id && k.player_name) next[k.player_id] = k.player_name;
          }
          return next;
        });
      } catch (e) {
        setPreloadError((e as Error).message);
      } finally {
        setPreloadLoading(false);
      }
    };
    fetchPreload();
  }, []);

  // On mount: try to reconnect from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved && !session) {
      connectSession(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save session_id to localStorage whenever session changes
  useEffect(() => {
    if (session?.session_id) {
      localStorage.setItem(SESSION_STORAGE_KEY, session.session_id);
    }
  }, [session?.session_id]);

  const loadRecommendations = useCallback(async () => {
    if (!session) return;
    try {
      setRecError(null);
      const res = await fetch(
        `${API_URL}/api/draft/sessions/${session.session_id}/recommendations?limit=50`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as TeamProfileResponse;
      const recs = (data.recommendations ?? []).map((r) => ({
        ...r,
        hscore: r.hscore ?? 0,
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
      setPlayerNames((prev) => {
        const next = { ...prev };
        for (const r of recs) {
          if (r.player_id && r.name) next[r.player_id] = r.name;
        }
        return next;
      });
    } catch (e) {
      setRecError((e as Error).message);
    }
  }, [session]);

  // Refresh recommendations and grid on every pick
  useEffect(() => {
    if (!session) return;
    refreshGrid();
    loadRecommendations();
  }, [session?.session_id, session?.picks_made, refreshGrid, loadRecommendations]);

  const handleStart = async () => {
    if (!preload || !myTeamKey) return;
    const order = preload.draft_order.map((p) => ({
      pick_number: p.pick_number,
      team_id: p.team_key,
      round: p.round,
    }));
    const keepers = preload.keepers.map((k) => ({
      team_id: k.team_key,
      player_id: k.player_id,
      round_cost: k.round_cost,
    }));
    await createSession({
      league_slug: "baseball",
      season: preload.season,
      my_team_id: myTeamKey,
      draft_order: order,
      keepers,
    });
  };

  const handleClearSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.reload();
  };

  const handlePick = async (playerId: number) => {
    await logPick(playerId);
  };

  // --- Setup screen (no session yet) ---
  if (!session) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Draft Board</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        {preloadLoading && (
          <div className="text-gray-500 text-sm">Loading league data...</div>
        )}

        {preloadError && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            <p className="font-medium">Could not load league data</p>
            <p>{preloadError}</p>
            <p className="mt-1 text-xs">Make sure baseball is synced: <code>python main.py sync baseball</code></p>
          </div>
        )}

        {preload && (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {preload.season} season · {preload.num_teams} teams · {preload.num_rounds} rounds · {preload.keepers.length} keepers
              </p>
              {preload.draft_order.length === 0 && (
                <p className="text-amber-600 text-sm">
                  Draft order not yet synced. Run: <code>python main.py sync baseball --season {preload.season}</code>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select your team</label>
              <div className="grid grid-cols-1 gap-2">
                {preload.teams.map((t) => (
                  <button
                    key={t.team_key}
                    onClick={() => setMyTeamKey(t.team_key)}
                    className={`p-3 text-left rounded border transition-colors ${
                      myTeamKey === t.team_key
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <span className="font-medium">{t.name}</span>
                    {t.manager_name && (
                      <span className="text-sm text-gray-500 ml-2">({t.manager_name})</span>
                    )}
                    {myTeamKey === t.team_key && (
                      <span className="float-right text-blue-600 text-sm">My team</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={loading || !myTeamKey || preload.draft_order.length === 0}
              className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Starting..." : "Start Draft"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- Active draft board ---
  const currentPick = session.current_pick;
  const currentTeamName = currentPick ? (teamNames[currentPick.team_id] || currentPick.team_id) : null;

  return (
    <div className="h-screen flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-white text-sm">
        <div className="flex items-center gap-3">
          <span className="font-bold">Pick {currentPick?.pick_number ?? "—"}</span>
          {currentPick && (
            <span className={session.is_my_pick ? "text-green-700 font-semibold" : "text-gray-600"}>
              {session.is_my_pick ? "YOUR PICK" : `${currentTeamName} picking`}
            </span>
          )}
          {!currentPick && <span className="text-gray-500">Draft complete</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undoPick} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
            Undo
          </button>
          <button onClick={handleClearSession} className="px-3 py-1 text-red-600 bg-red-50 rounded hover:bg-red-100 text-xs">
            New Session
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-1 text-sm">{error}</div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Draft Grid (2/3) */}
        <div className="w-2/3 p-2 overflow-auto border-r">
          <DraftGrid
            grid={grid}
            teams={grid.length > 0 ? [...new Set(grid.map((p) => p.team_id))] : []}
            playerNames={playerNames}
            teamNames={teamNames}
            numRounds={preload?.num_rounds ?? 24}
          />
        </div>

        {/* Right: Best Available (1/3) */}
        <div className="w-1/3 p-2 flex flex-col overflow-hidden">
          {recError && (
            <div className="bg-red-100 text-red-700 p-2 text-xs rounded mb-2">{recError}</div>
          )}
          <BestAvailable candidates={candidates} onPick={handlePick} />
        </div>
      </div>

      {/* Bottom: Team Category Profile */}
      <div className="h-44 border-t p-2 overflow-auto shrink-0">
        <TeamProfile categories={categoryInfo} />
      </div>
    </div>
  );
}

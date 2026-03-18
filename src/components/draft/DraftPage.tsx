import { useEffect, useState, useCallback } from "react";
import { DraftGrid } from "./DraftGrid";
import { BestAvailable } from "./BestAvailable";
import { TeamProfile } from "./TeamProfile";
import { useDraftSession } from "./useDraftSession";
import { API_URL } from "../../api/client";
import type { DraftCandidate, DraftPreload, DraftPreloadTeam } from "../../api/types";

const SESSION_KEY = "draft_session_id";
const ORDER_KEY = "draft_team_order";

interface TeamProfileResponse {
  recommendations: DraftCandidate[];
  team_profile: {
    category_totals: Record<string, number>;
    category_ranks: Record<string, number>;
    category_tiers: Record<string, string>;
  };
}

function generateDraftOrder(orderedTeams: DraftPreloadTeam[], numRounds: number) {
  const picks = [];
  for (let round = 1; round <= numRounds; round++) {
    for (let i = 0; i < orderedTeams.length; i++) {
      picks.push({
        pick_number: (round - 1) * orderedTeams.length + i + 1,
        team_id: orderedTeams[i].team_key,
        round,
      });
    }
  }
  return picks;
}

export function DraftPage() {
  const { session, grid, loading, error, logPick, undoPick, refreshGrid, connectSession, createSession } = useDraftSession();
  const [candidates, setCandidates] = useState<DraftCandidate[]>([]);
  const [playerNames, setPlayerNames] = useState<Record<number, string>>({});
  const [teamNames, setTeamNames] = useState<Record<string, string>>({});
  const [categoryInfo, setCategoryInfo] = useState<{ name: string; total: number; rank: number; tier: string }[]>([]);
  const [recError, setRecError] = useState<string | null>(null);

  const [preload, setPreload] = useState<DraftPreload | null>(null);
  const [preloadLoading, setPreloadLoading] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);

  // Draft setup state
  const [orderedTeams, setOrderedTeams] = useState<DraftPreloadTeam[]>([]);
  const [myTeamKey, setMyTeamKey] = useState("");

  // Load preload on mount
  useEffect(() => {
    const fetchPreload = async () => {
      setPreloadLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/draft/preload/baseball`);
        if (!res.ok) throw new Error(await res.text());
        const data: DraftPreload = await res.json();
        setPreload(data);

        const nameMap: Record<string, string> = {};
        for (const t of data.teams) nameMap[t.team_key] = t.name;
        setTeamNames(nameMap);

        setPlayerNames((prev) => {
          const next = { ...prev };
          for (const k of data.keepers) {
            if (k.player_id && k.player_name) next[k.player_id] = k.player_name;
          }
          return next;
        });

        // Restore saved order or use preloaded order or default team list
        const savedOrder = localStorage.getItem(ORDER_KEY);
        if (savedOrder) {
          try {
            const saved: string[] = JSON.parse(savedOrder);
            const teamMap = Object.fromEntries(data.teams.map((t) => [t.team_key, t]));
            const restored = saved.map((k) => teamMap[k]).filter(Boolean) as DraftPreloadTeam[];
            // Add any new teams not in saved order
            const missing = data.teams.filter((t) => !saved.includes(t.team_key));
            setOrderedTeams([...restored, ...missing]);
          } catch {
            setOrderedTeams(initTeamOrder(data));
          }
        } else if (data.draft_order.length > 0) {
          // Use round-1 picks as the authoritative order
          const round1 = data.draft_order.filter((p) => p.round === 1).sort((a, b) => a.pick_number - b.pick_number);
          const teamMap = Object.fromEntries(data.teams.map((t) => [t.team_key, t]));
          const ordered = round1.map((p) => teamMap[p.team_key]).filter(Boolean) as DraftPreloadTeam[];
          setOrderedTeams(ordered.length === data.teams.length ? ordered : initTeamOrder(data));
        } else {
          setOrderedTeams(initTeamOrder(data));
        }
      } catch (e) {
        setPreloadError((e as Error).message);
      } finally {
        setPreloadLoading(false);
      }
    };
    fetchPreload();
  }, []);

  // Try to reconnect saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved && !session) connectSession(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (session?.session_id) localStorage.setItem(SESSION_KEY, session.session_id);
  }, [session?.session_id]);

  const loadRecommendations = useCallback(async () => {
    if (!session) return;
    try {
      setRecError(null);
      const res = await fetch(`${API_URL}/api/draft/sessions/${session.session_id}/recommendations?limit=50`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as TeamProfileResponse;
      const recs = (data.recommendations ?? []).map((r) => ({ ...r, hscore: r.hscore ?? 0 }));
      setCandidates(recs);
      const p = data.team_profile;
      setCategoryInfo(Object.keys(p.category_totals).map((name) => ({
        name,
        total: p.category_totals[name] ?? 0,
        rank: p.category_ranks[name] ?? 5,
        tier: p.category_tiers[name] ?? "swing",
      })));
      setPlayerNames((prev) => {
        const next = { ...prev };
        for (const r of recs) if (r.player_id && r.name) next[r.player_id] = r.name;
        return next;
      });
    } catch (e) {
      setRecError((e as Error).message);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    refreshGrid();
    loadRecommendations();
  }, [session?.session_id, session?.picks_made, refreshGrid, loadRecommendations]);

  const moveTeam = (idx: number, dir: -1 | 1) => {
    const next = [...orderedTeams];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setOrderedTeams(next);
    localStorage.setItem(ORDER_KEY, JSON.stringify(next.map((t) => t.team_key)));
  };

  const handleStart = async () => {
    if (!preload || !myTeamKey) return;
    const numRounds = preload.num_rounds || 24;

    // Prefer preloaded draft order (from DB); fall back to computed from team order
    const order = preload.draft_order.length > 0
      ? preload.draft_order.map((p) => ({ pick_number: p.pick_number, team_id: p.team_key, round: p.round }))
      : generateDraftOrder(orderedTeams, numRounds);

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
    localStorage.removeItem(SESSION_KEY);
    window.location.reload();
  };

  // ---- Setup screen ----
  if (!session) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-5">Draft Board</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {preloadLoading && <p className="text-gray-500 text-sm">Loading league data...</p>}
        {preloadError && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            <p className="font-medium">Could not load league data</p>
            <p>{preloadError}</p>
            <p className="mt-1 text-xs">Ensure 2026 is synced: <code>python main.py sync baseball</code></p>
          </div>
        )}

        {preload && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              {preload.season} · {preload.num_teams} teams · {preload.num_rounds} rounds
              {preload.keepers.length > 0 && ` · ${preload.keepers.length} keepers`}
            </p>

            {/* Team order */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Draft order
                {preload.draft_order.length === 0 && (
                  <span className="ml-2 font-normal text-amber-600 text-xs">
                    (not yet on Yahoo — set manually)
                  </span>
                )}
              </label>
              <div className="space-y-1">
                {orderedTeams.map((t, idx) => (
                  <div
                    key={t.team_key}
                    onClick={() => setMyTeamKey(t.team_key)}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      myTeamKey === t.team_key
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-gray-400 text-sm w-5 text-right shrink-0">{idx + 1}</span>
                    <span className="flex-1 text-sm font-medium">{t.name}</span>
                    {t.manager_name && (
                      <span className="text-xs text-gray-500">{t.manager_name}</span>
                    )}
                    {myTeamKey === t.team_key && (
                      <span className="text-xs text-blue-600 font-semibold">me</span>
                    )}
                    {preload.draft_order.length === 0 && (
                      <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => moveTeam(idx, -1)}
                          disabled={idx === 0}
                          className="text-xs px-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30 leading-none"
                        >↑</button>
                        <button
                          onClick={() => moveTeam(idx, 1)}
                          disabled={idx === orderedTeams.length - 1}
                          className="text-xs px-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30 leading-none"
                        >↓</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Click a team to select as yours.</p>
            </div>

            <button
              onClick={handleStart}
              disabled={loading || !myTeamKey}
              className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Starting..." : "Start Draft"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---- Active draft board ----
  const currentPick = session.current_pick;
  const currentTeamName = currentPick ? (teamNames[currentPick.team_id] || currentPick.team_id) : null;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-white text-sm shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold">Pick {currentPick?.pick_number ?? "—"}</span>
          {currentPick && (
            <span className={session.is_my_pick ? "text-green-700 font-semibold" : "text-gray-600"}>
              {session.is_my_pick ? "YOUR PICK" : `${currentTeamName} picking`}
            </span>
          )}
          {!currentPick && <span className="text-gray-400">Draft complete</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={undoPick} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-xs">Undo</button>
          <button onClick={handleClearSession} className="px-3 py-1 text-red-600 bg-red-50 rounded hover:bg-red-100 text-xs">New Session</button>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 px-3 py-1 text-sm shrink-0">{error}</div>}

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-2/3 p-2 overflow-auto border-r">
          <DraftGrid
            grid={grid}
            teams={grid.length > 0 ? [...new Set(grid.map((p) => p.team_id))] : []}
            playerNames={playerNames}
            teamNames={teamNames}
            numRounds={preload?.num_rounds ?? 24}
          />
        </div>
        <div className="w-1/3 p-2 flex flex-col overflow-hidden">
          {recError && <div className="bg-red-100 text-red-700 p-2 text-xs rounded mb-2">{recError}</div>}
          <BestAvailable candidates={candidates} onPick={logPick} />
        </div>
      </div>

      <div className="h-44 border-t p-2 overflow-auto shrink-0">
        <TeamProfile categories={categoryInfo} />
      </div>
    </div>
  );
}

function initTeamOrder(data: DraftPreload): DraftPreloadTeam[] {
  return [...data.teams].sort((a, b) => a.team_key.localeCompare(b.team_key));
}

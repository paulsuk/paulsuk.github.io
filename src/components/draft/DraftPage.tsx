import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { DraftGrid } from "./DraftGrid";
import { BestAvailable } from "./BestAvailable";
import { TeamProfile } from "./TeamProfile";
import { SetupScreen } from "./SetupScreen";
import { RestartDialog } from "./RestartDialog";
import { useDraftSession, loadSaved } from "./useDraftSession";
import { useDraftPreload } from "./useDraftPreload";
import { useRecommendations } from "./useRecommendations";
import { DEFAULT_ROUNDS, generateDraftOrder } from "./draft-logic";
import { LAB_AUTH_KEY } from "../layout/PasswordGate";
import type { DraftSessionConfig } from "../../api/types";
import { useLabSport } from "../../utils/use-lab-sport";

export function DraftPage() {
  const { slug } = useLabSport();
  const authed = localStorage.getItem(LAB_AUTH_KEY) === "true";
  const { session, grid, loading, error, logPick, undoPick, refreshGrid, connectSession, createSession, restoreSession } = useDraftSession();
  const {
    data: preload, loading: preloadLoading, error: preloadError,
    orderedTeams, teamNames, keeperNames,
  } = useDraftPreload(slug);
  const {
    data: candidates, categoryInfo, names: recNames, error: recError,
    reload: loadRecommendations, removeCandidate, reset: resetCandidates,
  } = useRecommendations(session?.session_id ?? null);

  const [myTeamKey, setMyTeamKey] = useState("");

  // restoring=true while we're attempting auto-reconnect/restore on mount
  // Initialised to true if there's a saved session so setup screen never flashes
  const [restoring, setRestoring] = useState(() => loadSaved() !== null);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [pickingId, setPickingId] = useState<number | null>(null);

  const playerNames = { ...keeperNames, ...recNames };

  // Auto-restore saved session on mount
  useEffect(() => {
    const saved = loadSaved();
    if (!saved || session) {
      setRestoring(false);
      return;
    }
    const tryResume = async () => {
      const result = await connectSession(saved.session_id);
      if (result === null) {
        // Server restarted and lost the session — rebuild it from saved picks
        await restoreSession(saved);
      }
      setRestoring(false);
    };
    tryResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session) return;
    refreshGrid();
    loadRecommendations();
  }, [session?.session_id, session?.picks_made, refreshGrid, loadRecommendations]);

  const handleStart = async () => {
    if (!preload || !myTeamKey) return;
    const numRounds = preload.num_rounds || DEFAULT_ROUNDS;
    const order = preload.draft_order.length > 0
      ? preload.draft_order.map((p) => ({ pick_number: p.pick_number, team_id: p.team_key, round: p.round }))
      : generateDraftOrder(orderedTeams, numRounds);
    const config: DraftSessionConfig = {
      league_slug: slug,
      season: preload.season,
      my_team_id: myTeamKey,
      draft_order: order,
      keepers: preload.keepers.map((k) => ({
        team_id: k.team_key,
        player_id: k.player_id,
        round_cost: k.round_cost,
      })),
    };
    await createSession(config);
  };

  const handleNewSession = async () => {
    const saved = loadSaved();
    setShowRestartDialog(false);
    if (saved) {
      resetCandidates();
      await createSession(saved.config);
    }
  };

  const handlePick = useCallback(async (playerId: number) => {
    setPickingId(playerId);
    removeCandidate(playerId);
    await logPick(playerId);
    setPickingId(null);
    // Always reload after pick: on failure this restores the optimistically-removed
    // player; on success the useEffect on session.picks_made also fires (idempotent).
    await loadRecommendations();
  }, [logPick, loadRecommendations, removeCandidate]);

  // Auth gate
  if (!authed) return <Navigate to="/lab" replace />;

  // ---- Restoring state ----
  if (restoring) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-5">Draft Board</h1>
        <p className="text-ink-soft text-sm">Restoring session...</p>
      </div>
    );
  }

  // ---- Setup screen ----
  if (!session) {
    return (
      <SetupScreen
        preload={preload}
        preloadLoading={preloadLoading}
        preloadError={preloadError}
        sessionError={error}
        orderedTeams={orderedTeams}
        myTeamKey={myTeamKey}
        onSelectTeam={setMyTeamKey}
        onStart={handleStart}
        starting={loading}
      />
    );
  }

  // ---- Active draft board ----
  const currentPick = session.current_pick;
  const currentTeamName = currentPick ? (teamNames[currentPick.team_id] || currentPick.team_id) : null;

  return (
    <div className="h-screen flex flex-col">
      <RestartDialog
        open={showRestartDialog}
        onCancel={() => setShowRestartDialog(false)}
        onConfirm={handleNewSession}
      />

      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-raised text-sm shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold">Pick {currentPick?.pick_number ?? "—"}</span>
          {currentPick && (
            <span className={session.is_my_pick ? "text-green-700 font-semibold" : "text-ink-soft"}>
              {session.is_my_pick ? "YOUR PICK" : `${currentTeamName} picking`}
            </span>
          )}
          {!currentPick && <span className="text-ink-faint">Draft complete</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={undoPick} className="px-3 py-1 bg-rule/60 rounded hover:bg-rule text-xs">Undo</button>
          <button onClick={() => setShowRestartDialog(true)} className="px-3 py-1 text-red-600 bg-red-50 rounded hover:bg-red-100 text-xs">Restart</button>
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
            numRounds={preload?.num_rounds ?? DEFAULT_ROUNDS}
          />
        </div>
        <div className="w-1/3 p-2 flex flex-col overflow-hidden">
          {recError && (
            <div className="bg-red-100 text-red-700 p-2 text-xs rounded mb-2 flex items-center justify-between gap-2">
              <span className="truncate">{recError}</span>
              <button onClick={loadRecommendations} className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 shrink-0">Retry</button>
            </div>
          )}
          <BestAvailable candidates={candidates} onPick={handlePick} disabled={pickingId !== null} />
        </div>
      </div>

      <div className="h-88 border-t p-2 overflow-auto shrink-0">
        <TeamProfile categories={categoryInfo} numTeams={preload?.num_teams ?? 0} />
      </div>
    </div>
  );
}

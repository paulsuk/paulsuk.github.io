import { useState, useCallback, useRef } from "react";
import { API_URL } from "../../api/client";
import type { DraftSession, DraftPick, DraftSessionConfig, SavedDraftSession } from "../../api/types";

const API = "/api/draft";
const STORAGE_KEY = "draft_session";

export function loadSaved(): SavedDraftSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedDraftSession) : null;
  } catch {
    return null;
  }
}

function saveSaved(payload: SavedDraftSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearSaved(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function useDraftSession() {
  const [session, setSession] = useState<DraftSession | null>(null);
  const [grid, setGrid] = useState<DraftPick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize from localStorage so undoPick doesn't corrupt picks after
  // a successful connectSession (200 path — server was still alive).
  const picksRef = useRef<number[]>(loadSaved()?.picks ?? []);

  const createSession = useCallback(async (config: DraftSessionConfig) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${API}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: DraftSession = await res.json();
      setSession(data);
      picksRef.current = [];
      saveSaved({ session_id: data.session_id, config, picks: [] });
      return data;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const connectSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${API}/sessions/${sessionId}`);
      if (res.status === 404) {
        // Session expired — caller is responsible for restore; don't surface as error
        return null;
      }
      if (!res.ok) throw new Error(await res.text());
      const data: DraftSession = await res.json();
      setSession(data);
      return data;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreSession = useCallback(async (saved: SavedDraftSession) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${API}/sessions/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...saved.config, picks_made: saved.picks }),
      });
      if (!res.ok) {
        // Server explicitly rejected the restore (4xx/5xx) — clear saved state
        // since retrying with the same data won't help.
        setError(await res.text());
        clearSaved();
        return null;
      }
      const data: DraftSession = await res.json();
      setSession(data);
      picksRef.current = [...saved.picks];
      saveSaved({ ...saved, session_id: data.session_id });
      return data;
    } catch (e) {
      // Network error — keep saved state intact so user can retry on reload
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshGrid = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_URL}${API}/sessions/${session.session_id}/grid`);
      if (!res.ok) throw new Error(await res.text());
      const data: DraftPick[] = await res.json();
      setGrid(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [session]);

  const logPick = useCallback(async (playerId: number) => {
    if (!session) return;
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}${API}/sessions/${session.session_id}/picks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player_id: playerId }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSession((prev) => prev ? { ...prev, ...data } : null);
      const saved = loadSaved();
      if (saved) {
        picksRef.current = [...picksRef.current, playerId];
        saveSaved({ ...saved, picks: picksRef.current });
      }
      await refreshGrid();
    } catch (e) {
      setError((e as Error).message);
    }
  }, [session, refreshGrid]);

  const undoPick = useCallback(async () => {
    if (!session) return;
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}${API}/sessions/${session.session_id}/picks/last`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSession((prev) => prev ? { ...prev, ...data } : null);
      const saved = loadSaved();
      if (saved) {
        picksRef.current = picksRef.current.slice(0, -1);
        saveSaved({ ...saved, picks: picksRef.current });
      }
      await refreshGrid();
    } catch (e) {
      setError((e as Error).message);
    }
  }, [session, refreshGrid]);

  return {
    session, grid, loading, error,
    createSession, connectSession, restoreSession,
    logPick, undoPick, refreshGrid,
  };
}

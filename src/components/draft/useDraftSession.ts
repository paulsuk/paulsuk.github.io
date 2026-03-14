import { useState, useCallback } from "react";
import { API_URL } from "../../api/client";
import type { DraftSession, DraftPick } from "../../api/types";

const API = "/api/draft";

export function useDraftSession() {
  const [session, setSession] = useState<DraftSession | null>(null);
  const [grid, setGrid] = useState<DraftPick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (body: unknown) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${API}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
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

  const connectSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${API}/sessions/${sessionId}`);
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
      await refreshGrid();
    } catch (e) {
      setError((e as Error).message);
    }
  }, [session, refreshGrid]);

  return { session, grid, loading, error, createSession, connectSession, logPick, undoPick, refreshGrid };
}

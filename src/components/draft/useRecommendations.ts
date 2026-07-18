import { useCallback, useState } from "react";
import { API_URL } from "../../api/client";
import type { DraftCandidate, TeamProfileResponse } from "../../api/types";

export interface CategoryInfo {
  name: string;
  total: number;
  rank: number;
  tier: string;
}

/**
 * Recommendations + team-profile categories for a draft session.
 * { data: candidates, loading, error } triple plus reload() and the
 * name map / category info derived from the last successful fetch.
 */
export function useRecommendations(sessionId: string | null) {
  const [data, setData] = useState<DraftCandidate[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo[]>([]);
  const [names, setNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/draft/sessions/${sessionId}/recommendations?limit=1000`);
      if (!res.ok) throw new Error(await res.text());
      const payload = await res.json() as TeamProfileResponse;
      const recs = (payload.recommendations ?? []).map((r) => ({ ...r, hscore: r.hscore ?? 0 }));
      setData(recs);
      const p = payload.team_profile;
      setCategoryInfo(Object.keys(p.category_totals).map((name) => ({
        name,
        total: p.category_totals[name] ?? 0,
        rank: p.category_ranks[name] ?? 5,
        tier: p.category_tiers[name] ?? "swing",
      })));
      setNames((prev) => {
        const next = { ...prev };
        for (const r of recs) if (r.player_id && r.name) next[r.player_id] = r.name;
        return next;
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  /** Optimistically drop a picked player from the candidate list. */
  const removeCandidate = useCallback((playerId: number) => {
    setData((prev) => prev.filter((c) => c.player_id !== playerId));
  }, []);

  const reset = useCallback(() => setData([]), []);

  return { data, categoryInfo, names, loading, error, reload, removeCandidate, reset };
}

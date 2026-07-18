import { useEffect, useState } from "react";
import { API_URL } from "../../api/client";
import type { DraftPreload, DraftPreloadTeam } from "../../api/types";
import { deriveOrderedTeams } from "./draft-logic";

/**
 * Loads /api/draft/preload/{slug} once and derives display maps.
 * Returns the conventional { data, loading, error } triple plus the
 * derived team ordering, team-name map, and keeper player names.
 */
export function useDraftPreload(slug: string) {
  const [data, setData] = useState<DraftPreload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderedTeams, setOrderedTeams] = useState<DraftPreloadTeam[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/draft/preload/${slug}`);
        if (!res.ok) throw new Error(await res.text());
        const payload: DraftPreload = await res.json();
        if (cancelled) return;
        setData(payload);
        setOrderedTeams(deriveOrderedTeams(payload));
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [slug]);

  const teamNames: Record<string, string> = {};
  for (const t of data?.teams ?? []) teamNames[t.team_key] = t.name;

  const keeperNames: Record<number, string> = {};
  for (const k of data?.keepers ?? []) {
    if (k.player_id && k.player_name) keeperNames[k.player_id] = k.player_name;
  }

  return { data, loading, error, orderedTeams, teamNames, keeperNames };
}

import { useCallback, useEffect, useState } from "react";
import { API_URL, clearCache, fetchApi, postApi } from "./client";
import type { Season, RecapResponse, ManagersResponse, PlayoffResponse, Article, ArticleDetail, ArticleDetailResponse, FranchiseDetailResponse, LabUiConfig, RankingsResponse, PlayerDetail, TeamAnalysisResponse, StandingsHistoryResponse, AwardsHistoryResponse, TeamPScoresResponse, PlayoffHistoryResponse, PlayerCard, PlayerChip, PlayerRef, PlayerResolveResponse, PlayerSearchResponse } from "./types";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function useApiData<T>(path: string | null): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchApi<T>(path)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [path, refreshToken]);

  const refresh = useCallback(() => {
    if (path) clearCache(`${API_URL}${path}`);
    setRefreshToken((t) => t + 1);
  }, [path]);

  return { data, loading, error, refresh };
}

export function useSeasons(slug: string) {
  return useApiData<Season[]>(`/api/${slug}/seasons`);
}

export function useRecap(slug: string, week?: number, season?: number, includeLeaders = false) {
  const params = new URLSearchParams();
  if (week) params.set("week", String(week));
  if (season) params.set("season", String(season));
  if (includeLeaders) params.set("include_leaders", "true");
  const qs = params.toString();
  const path = `/api/${slug}/recap${qs ? `?${qs}` : ""}`;
  return useApiData<RecapResponse>(path);
}

export function useManagers(slug: string) {
  return useApiData<ManagersResponse>(`/api/${slug}/managers`);
}

export function useFranchiseDetail(slug: string, franchiseId: string) {
  return useApiData<FranchiseDetailResponse>(`/api/${slug}/franchise/${franchiseId}`);
}

export function usePlayoffs(slug: string, season?: number, enabled = true) {
  const params = new URLSearchParams();
  if (season) params.set("season", String(season));
  const qs = params.toString();
  const path = enabled ? `/api/${slug}/playoffs${qs ? `?${qs}` : ""}` : null;
  return useApiData<PlayoffResponse>(path);
}

export function useArticles(slug: string, season?: number) {
  const params = new URLSearchParams();
  if (season) params.set("season", String(season));
  const qs = params.toString();
  const path = `/api/${slug}/articles${qs ? `?${qs}` : ""}`;
  const { data, loading, error } = useApiData<{ articles: Article[] }>(path);
  return { data: data?.articles ?? [], loading, error };
}

export function useLabUiConfig(sport: string) {
  return useApiData<LabUiConfig>(`/api/lab/${sport}/ui-config`);
}

export function useRankings(
  sport: string | null,
  params: {
    season: string;
    model: string;
    start?: string;
    end?: string;
    position?: string;
    team?: string;
    available_only?: boolean;
    punt?: string;
  }
) {
  const query = new URLSearchParams({
    season: params.season,
    model: params.model,
    ...(params.start ? { start: params.start } : {}),
    ...(params.end ? { end: params.end } : {}),
    ...(params.position ? { position: params.position } : {}),
    ...(params.team ? { team: params.team } : {}),
    ...(params.available_only ? { available_only: "true" } : {}),
    ...(params.punt ? { punt: params.punt } : {}),
  });
  const url = sport
    ? `/api/lab/${sport}/rankings?${query.toString()}`
    : null;
  return useApiData<RankingsResponse>(url);
}

export function usePlayerDetail(
  sport: string,
  playerRef: string | null,
  season: string,
  model: string,
  start?: string,
  end?: string,
) {
  const params = new URLSearchParams({ season, model });
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const url = playerRef
    ? `/api/lab/${sport}/players/${encodeURIComponent(playerRef)}?${params.toString()}`
    : null;
  return useApiData<PlayerDetail>(url);
}

export function useArticle(slug: string, articleId: string | undefined) {
  const path = articleId ? `/api/${slug}/articles/${articleId}` : null;
  const { data, loading, error } = useApiData<ArticleDetailResponse>(path);

  const detail: ArticleDetail | null = data
    ? {
        ...data.article,
        prev_id: data.prev_id,
        next_id: data.next_id,
        season_articles: data.season_articles,
      }
    : null;

  return { data: detail, loading, error };
}

export function useTeamAnalysis(sport: string | null) {
  return useApiData<TeamAnalysisResponse>(
    sport ? `/api/lab/${sport}/team-analysis` : null
  );
}

function seasonPath(slug: string, endpoint: string, season?: number): string {
  const qs = season ? `?season=${season}` : "";
  return `/api/${slug}/${endpoint}${qs}`;
}

export function useStandingsHistory(slug: string | null, season?: number) {
  return useApiData<StandingsHistoryResponse>(slug ? seasonPath(slug, "standings-history", season) : null);
}

export function useAwardsHistory(slug: string | null, season?: number) {
  return useApiData<AwardsHistoryResponse>(slug ? seasonPath(slug, "awards-history", season) : null);
}

export function useTeamPScores(slug: string | null, season?: number) {
  return useApiData<TeamPScoresResponse>(slug ? seasonPath(slug, "team-pscores", season) : null);
}

export function usePlayoffHistory(slug: string, enabled = true) {
  return useApiData<PlayoffHistoryResponse>(enabled ? `/api/${slug}/playoff-history` : null);
}

export function usePlayer(uid: string | null) {
  return useApiData<PlayerCard>(uid ? `/api/players/${encodeURIComponent(uid)}` : null);
}

export function usePlayers(sport: string, refs: PlayerRef[]) {
  const [data, setData] = useState<Record<string, PlayerChip>>({});
  const [loading, setLoading] = useState(refs.length > 0);
  const [error, setError] = useState<string | null>(null);
  // Stable key so the effect only re-fires when the ref set actually changes.
  const key = refs.map((r) => `${r.type}:${r.value}`).sort().join("|");

  useEffect(() => {
    if (refs.length === 0) {
      setData({});
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    postApi<PlayerResolveResponse>("/api/players/resolve", { sport, ids: refs })
      .then((r) => setData(r.players))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sport, key]);

  return { data, loading, error };
}

export function usePlayerSearch(sport: string, q: string) {
  const path = q.trim().length >= 2
    ? `/api/players/search?sport=${sport}&q=${encodeURIComponent(q.trim())}`
    : null;
  const { data, loading, error } = useApiData<PlayerSearchResponse>(path);
  return { data: data?.results ?? [], loading, error };
}

import { useEffect, useState } from "react";
import { fetchApi } from "./client";
import type { Franchise, Season, RecapResponse, ManagersResponse, RecordsResponse, PlayoffResponse, Article, ArticleDetail, ArticleDetailResponse, FranchiseDetailResponse, LabUiConfig, RankingsResponse, PlayerDetail } from "./types";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useApiData<T>(path: string | null): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [path]);

  return { data, loading, error };
}

export function useFranchises() {
  return useApiData<Franchise[]>("/api/franchises");
}

export function useSeasons(slug: string) {
  return useApiData<Season[]>(`/api/${slug}/seasons`);
}

export function useRecap(slug: string, week?: number, season?: number) {
  const params = new URLSearchParams();
  if (week) params.set("week", String(week));
  if (season) params.set("season", String(season));
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

export function useRecords(slug: string, includePlayoffs = false) {
  const path = includePlayoffs
    ? `/api/${slug}/records?include_playoffs=true`
    : `/api/${slug}/records`;
  return useApiData<RecordsResponse>(path);
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
  sport: string,
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
  return useApiData<RankingsResponse>(
    `/api/lab/${sport}/rankings?${query.toString()}`
  );
}

export function usePlayerDetail(
  sport: string,
  playerId: number | null,
  season: string,
  model: string,
  start?: string,
  end?: string,
) {
  const params = new URLSearchParams({ season, model });
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const url = playerId
    ? `/api/lab/${sport}/players/${playerId}?${params.toString()}`
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

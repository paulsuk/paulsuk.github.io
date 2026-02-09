import { useEffect, useState } from "react";
import { fetchApi, fetchText } from "./client";
import type { Franchise, Season, RecapResponse, Article } from "./types";

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

let articlesCache: Article[] | null = null;

export function useArticles(slug: string, season?: number) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (articlesCache) {
      const filtered = articlesCache.filter(
        (a) => a.slug === slug && (!season || a.season === season)
      );
      setArticles(filtered);
      setLoading(false);
      return;
    }

    fetchText(`${import.meta.env.BASE_URL}articles/index.json`)
      .then((text) => {
        const all: Article[] = text ? JSON.parse(text) : [];
        articlesCache = all;
        const filtered = all.filter(
          (a) => a.slug === slug && (!season || a.season === season)
        );
        setArticles(filtered);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [slug, season]);

  return { articles, loading };
}

export function useArticleContent(filePath: string | null) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filePath) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchText(`${import.meta.env.BASE_URL}articles/${filePath}`)
      .then(setContent)
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [filePath]);

  return { content, loading };
}

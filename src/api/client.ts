export const API_URL = import.meta.env.VITE_API_URL ?? "";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

async function fetchWithRetry(url: string, retries = 2, delay = 2000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 503 && attempt < retries) {
        await new Promise((r) => setTimeout(r, delay * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delay * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  return fetch(url); // unreachable, satisfies TS
}

export async function fetchApi<T>(path: string): Promise<T> {
  const url = `${API_URL}${path}`;

  const cached = getCached<T>(url);
  if (cached) return cached;

  const res = await fetchWithRetry(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data as T;
}

export function clearCache(url: string) {
  cache.delete(url);
}

export async function fetchText(url: string): Promise<string | null> {
  const cached = getCached<string>(url);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) return null;

  const text = await res.text();
  cache.set(url, { data: text, timestamp: Date.now() });
  return text;
}

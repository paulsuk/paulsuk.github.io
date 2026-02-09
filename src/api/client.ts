const API_URL = import.meta.env.VITE_API_URL;

const cache = new Map<string, unknown>();

export async function fetchApi<T>(path: string): Promise<T> {
  const url = `${API_URL}${path}`;

  const cached = cache.get(url);
  if (cached) return cached as T;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  cache.set(url, data);
  return data as T;
}

export async function fetchText(url: string): Promise<string | null> {
  const cached = cache.get(url);
  if (cached) return cached as string;

  const res = await fetch(url);
  if (!res.ok) return null;

  const text = await res.text();
  cache.set(url, text);
  return text;
}

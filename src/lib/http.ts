export async function apiFetch(path: string, options: RequestInit = {}) {
  const base = (import.meta as any).env?.VITE_API_BASE_URL || "";
  const url = base ? new URL(path, base).toString() : path;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  } as Record<string, string>;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res;
}

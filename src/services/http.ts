import { API_BASE_URL } from "@/config";
import { getAuthRetryFn } from "@/services/authRetry";

async function fetchWithRetry(
  path: string,
  token: string,
  init: RequestInit
): Promise<Response> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (res.status === 401) {
    const retryFn = getAuthRetryFn();
    if (retryFn) {
      const newToken = await retryFn();
      const retry = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${newToken}`,
          "Content-Type": "application/json",
          ...(init.headers || {}),
        },
      });
      if (!retry.ok) {
        const txt = await retry.text().catch(() => "");
        throw new Error(`HTTP ${retry.status}: ${txt || retry.statusText}`);
      }
      return retry;
    }
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }
  return res;
}

export async function httpGet<T>(path: string, token: string, signal?: AbortSignal): Promise<T> {
  const res = await fetchWithRetry(path, token, { method: "GET", signal });
  return res.json();
}

export async function httpPost<T>(
  path: string,
  token: string,
  body?: unknown,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetchWithRetry(path, token, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  return res.json();
}

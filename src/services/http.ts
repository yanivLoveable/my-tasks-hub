import { API_BASE_URL } from "@/config";

export async function httpGet<T>(
  path: string,
  token: string,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function httpPost<T>(
  path: string,
  body?: string | Record<string, unknown>,
  headers?: Record<string, string>,
  signal?: AbortSignal
): Promise<T> {
  const isFormData = typeof body === "string";
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(isFormData
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    signal,
  });
  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${errorBody || res.statusText}`);
  }
  return res.json();
}

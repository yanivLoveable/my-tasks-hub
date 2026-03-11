import { API_BASE_URL } from "@/config";

const ACCESS_TOKEN_KEY = "notifCenter.apiAccessToken";

type JWTPayload = { exp?: number } & Record<string, unknown>;

type AuthResponse = { accessToken: string };

function decodeJwtPayload<T extends JWTPayload>(token: string): T | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const json = atob(padded);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function isJwtExpired(token: string, nowMs: number = Date.now()): boolean {
  const payload = decodeJwtPayload<JWTPayload>(token);
  const expMs = payload?.exp ? payload.exp * 1000 : 0;
  return !expMs || expMs <= nowMs;
}

export function getStoredAccessToken(): string | null {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;
  if (isJwtExpired(token)) return null;
  return token;
}

export function storeAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

function mapAuthError(status: number, backendMessage?: string): Error {
  if (status === 400) return new Error("שגיאת אימות: בקשה לא תקינה (400)");
  if (status === 401) return new Error("שגיאת אימות: פרטי לקוח שגויים (401)");
  if (status === 502) return new Error("שגיאת אימות: שרת Keycloak לא זמין (502)");
  if (status === 503) return new Error("שגיאת אימות: שרת Keycloak לא זמין (503)");
  if (status === 504) return new Error("שגיאת אימות: שרת Keycloak לא זמין (504)");
  if (backendMessage) return new Error(`שגיאת אימות: ${backendMessage}`);
  return new Error(`שגיאת אימות: HTTP ${status}`);
}

async function exchangeKeycloakToken(keycloakToken: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keycloakToken }),
  });

  const data = (await res.json().catch(() => ({}))) as Partial<AuthResponse> & {
    message?: string;
  };

  if (!res.ok) {
    throw mapAuthError(res.status, data.message);
  }

  if (!data.accessToken) {
    throw new Error("שגיאת אימות: תגובת שרת לא תקינה (חסר accessToken)");
  }

  return data.accessToken;
}

/**
 * Returns a valid API access token.
 *
 * - If a non-expired token exists in localStorage → returns it.
 * - Otherwise, if `keycloakToken` is provided → exchanges it via backend and stores the result.
 */
export async function getAccessToken(keycloakToken?: string): Promise<string> {
  const token = getStoredAccessToken();
  if (token) return token;

  if (!keycloakToken) {
    throw new Error("שגיאת אימות: חסר Keycloak token");
  }

  try {
    const apiAccessToken = await exchangeKeycloakToken(keycloakToken);
    storeAccessToken(apiAccessToken);
    return apiAccessToken;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("(400)")) throw err;
    if (msg.includes("(401)")) throw err;
    if (msg.includes("(502)")) throw err;
    if (msg.includes("(503)")) throw err;
    if (msg.includes("(504)")) throw err;
    throw new Error(`שגיאת אימות: ${msg}`);
  }
}

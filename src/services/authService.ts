import { CLIENT_ID, CLIENT_SECRET } from "@/config";
import { httpPost } from "./http";
import type { AuthTokenResponse } from "@/types/api";

const TOKEN_KEY = "notifCenter.authToken";
const EXPIRY_KEY = "notifCenter.authExpiry";

let cachedToken: string | null = null;
let cachedExpiry: number = 0;

function loadFromStorage() {
  if (cachedToken) return;
  cachedToken = localStorage.getItem(TOKEN_KEY);
  const exp = localStorage.getItem(EXPIRY_KEY);
  cachedExpiry = exp ? parseInt(exp, 10) : 0;
}

function saveToStorage(token: string, expiresIn: number) {
  const expiry = Date.now() + expiresIn * 1000 - 30000; // 30s buffer
  cachedToken = token;
  cachedExpiry = expiry;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRY_KEY, String(expiry));
}

function isExpired(): boolean {
  return Date.now() >= cachedExpiry;
}

export async function getAccessToken(): Promise<string> {
  loadFromStorage();

  if (cachedToken && !isExpired()) {
    return cachedToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing client credentials (VITE_CLIENT_ID / VITE_CLIENT_SECRET)");
  }

  const body = `clientId=${encodeURIComponent(CLIENT_ID)}&clientSecret=${encodeURIComponent(CLIENT_SECRET)}`;

  try {
    const data = await httpPost<AuthTokenResponse>(
      "/api/auth/token",
      body
    );
    saveToStorage(data.access_token, data.expires_in);
    return data.access_token;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("400")) throw new Error("שגיאת אימות: בקשה לא תקינה (400)");
    if (msg.includes("401")) throw new Error("שגיאת אימות: פרטי לקוח שגויים (401)");
    if (msg.includes("502")) throw new Error("שגיאת אימות: שרת Keycloak לא זמין (502)");
    throw new Error(`שגיאת אימות: ${msg}`);
  }
}

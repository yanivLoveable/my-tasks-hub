import { API_BASE_URL } from "@/config";

type AuthResponse = { accessToken: string };

export async function exchangeKeycloakToken(keycloakToken: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keycloakToken }),
  });

  const data = (await res.json().catch(() => ({}))) as Partial<AuthResponse> & { message?: string };

  if (!res.ok) {
    throw new Error(data.message || "Authentication failed");
  }
  if (!data.accessToken) {
    throw new Error("Authentication failed: missing accessToken");
  }

  return data.accessToken;
}
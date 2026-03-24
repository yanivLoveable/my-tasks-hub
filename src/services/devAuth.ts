import { APP_ENV, API_BASE_URL, CLIENT_ID, CLIENT_SECRET } from "@/config";
import { storeAccessToken } from "@/services/authService";

/**
 * Dev-only: authenticates via client_id + client_secret → Keycloak token → API access token.
 * Mirrors what you'd do manually in Swagger.
 */
export async function devAuthenticate(): Promise<string> {
  if (APP_ENV !== "dev") {
    throw new Error("devAuthenticate() is only allowed in dev environment");
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "Dev auth: missing VITE_CLIENT_ID or VITE_CLIENT_SECRET in .env"
    );
  }

  const tokenRes = await fetch(`${API_BASE_URL}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }),
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text().catch(() => "");
    throw new Error(`Dev auth failed (HTTP ${tokenRes.status}): ${txt}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string; token?: string };
  const keycloakToken = tokenData.access_token || tokenData.token;

  if (!keycloakToken) {
    throw new Error("Dev auth: response missing access_token/token field");
  }

  storeAccessToken(keycloakToken);
  return keycloakToken;
}

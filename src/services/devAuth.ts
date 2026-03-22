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

  // Step 1: get Keycloak token via backend proxy
  const tokenRes = await fetch(`${API_BASE_URL}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }),
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text().catch(() => "");
    throw new Error(`Dev auth step 1 failed (HTTP ${tokenRes.status}): ${txt}`);
  }

  const tokenData = (await tokenRes.json()) as { accessToken?: string; token?: string };
  const keycloakToken = tokenData.accessToken || tokenData.token;

  if (!keycloakToken) {
    throw new Error(
      "Dev auth step 1: response missing accessToken/token field"
    );
  }

  // Step 2: exchange Keycloak token for API access token
  const authRes = await fetch(`${API_BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keycloakToken }),
  });

  if (!authRes.ok) {
    const txt = await authRes.text().catch(() => "");
    throw new Error(`Dev auth step 2 failed (HTTP ${authRes.status}): ${txt}`);
  }

  const authData = (await authRes.json()) as { accessToken?: string };

  if (!authData.accessToken) {
    throw new Error("Dev auth step 2: response missing accessToken");
  }

  storeAccessToken(authData.accessToken);
  return authData.accessToken;
}

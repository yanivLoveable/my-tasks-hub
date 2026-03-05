export type AppEnv = "dev" | "test" | "prod";

const rawEnv = import.meta.env.VITE_APP_ENV as string | undefined;
export const APP_ENV: AppEnv =
  rawEnv === "test" ? "test" : rawEnv === "prod" ? "prod" : "dev";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || "";
export const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET || "";

// Keycloak (SSO)
export const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || "";
export const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || "";
export const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "";

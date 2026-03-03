export type AppEnv = "dev" | "test" | "prod";

const raw = import.meta.env.VITE_APP_ENV as string | undefined;

export const APP_ENV: AppEnv =
  raw === "test" ? "test" : raw === "prod" ? "prod" : "dev";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || "";
export const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET || "";
export const USER_ID = import.meta.env.VITE_USER_ID || "QA_USER_1";

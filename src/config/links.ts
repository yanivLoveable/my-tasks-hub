import { type AppEnv } from "./env";

type SystemKey = "DOCS" | "SNOW" | "ERP";

export const LINK_HOSTS: Record<SystemKey, Record<AppEnv, string>> = {
  DOCS: {
    dev: "docs-dev.example.com",
    test: "docs-test.example.com",
    prod: "docs.example.com",
  },
  SNOW: {
    dev: "snow-dev.example.com",
    test: "snow-test.example.com",
    prod: "snow.example.com",
  },
  ERP: {
    dev: "erp-dev.example.com",
    test: "erp-test.example.com",
    prod: "erp.example.com",
  },
};

export function rewriteTaskUrl(
  originalUrl: string,
  systemLabel: string,
  env: AppEnv
): string {
  const hostMap = LINK_HOSTS[systemLabel as SystemKey];
  if (!hostMap || !hostMap[env]) return originalUrl;

  try {
    const url = new URL(originalUrl);
    url.hostname = hostMap[env];
    return url.toString();
  } catch {
    return originalUrl;
  }
}

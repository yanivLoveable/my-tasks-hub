export type JWTPayload = {
  exp?: number;
  sub?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  sAMAccountName?: string;
  username?: string;
} & Record<string, unknown>;

export type User = {
  id: string;
  username?: string;
  name?: string;
  email?: string;
};

export function decodeJwtPayload<T = JWTPayload>(token: string): T | null {
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
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function userFromPayload(p: JWTPayload | null): User | null {
  if (!p) return null;
  const id = p.sAMAccountName ?? "";
  if (!id) return null;
  return {
    id,
    username:
      (typeof p.username === "string" && p.username) ||
      (typeof p.preferred_username === "string" && p.preferred_username) ||
      undefined,
    name: typeof p.name === "string" ? p.name : undefined,
    email: typeof p.email === "string" ? p.email : undefined,
  };
}

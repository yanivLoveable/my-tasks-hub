import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Keycloak from "keycloak-js";
import { KEYCLOAK_CLIENT_ID, KEYCLOAK_REALM, KEYCLOAK_URL } from "@/config";
import { exchangeKeycloakToken } from "@/services/authClient";

export type AuthStatus = "loading" | "ready" | "error";

export type User = {
  id: string;
  username?: string;
  name?: string;
  email?: string;
};

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  authenticate: () => Promise<string>; // returns API access token
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  status: "loading",
  authenticate: async () => {
    throw new Error("AuthProvider missing");
  },
  logout: () => {},
});

const ACCESS_TOKEN_KEY = "notifCenter.apiAccessToken";
const USER_KEY = "notifCenter.user";

type JWTPayload = Partial<User> & { exp?: number };

function decodeJwtPayload<T>(token: string): T | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function userFromPayload(p: JWTPayload | null): User | null {
  if (!p) return null;
  const id = typeof p.id === "string" ? p.id : "";
  if (!id) return null;
  return {
    id,
    username: typeof p.username === "string" ? p.username : undefined,
    name: typeof p.name === "string" ? p.name : undefined,
    email: typeof p.email === "string" ? p.email : undefined,
  };
}

function getStoredTokenInfo() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const payload = token ? decodeJwtPayload<JWTPayload>(token) : null;
  const expMs = payload?.exp ? payload.exp * 1000 : null;
  const isValid = Boolean(token && expMs && expMs > Date.now());
  return { token, payload, expMs, isValid, user: userFromPayload(payload) };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  if (!KEYCLOAK_URL || !KEYCLOAK_REALM || !KEYCLOAK_CLIENT_ID) {
    throw new Error("Missing Keycloak config: VITE_KEYCLOAK_URL / VITE_KEYCLOAK_REALM / VITE_KEYCLOAK_CLIENT_ID");
  }

  const keycloak = useMemo(
    () =>
      new Keycloak({
        url: KEYCLOAK_URL.replace(/\/$/, ""),
        realm: KEYCLOAK_REALM,
        clientId: KEYCLOAK_CLIENT_ID,
      }),
    []
  );

  const keycloakInitPromiseRef = useRef<Promise<boolean> | null>(null);
  const ensureInFlightRef = useRef<Promise<void> | null>(null);

  const initKeycloakOnce = useCallback(() => {
    if (!keycloakInitPromiseRef.current) {
      keycloakInitPromiseRef.current = keycloak.init({ onLoad: "login-required" });
    }
    return keycloakInitPromiseRef.current;
  }, [keycloak]);

  const authenticate = useCallback(async () => {
    const ok = await initKeycloakOnce();
    if (!ok) throw new Error("Keycloak init failed");

    const keycloakToken = keycloak.token;
    if (!keycloakToken) throw new Error("Missing Keycloak token");

    // exchange KC token => API token
    const apiAccessToken = await exchangeKeycloakToken(keycloakToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, apiAccessToken);

    const payload = decodeJwtPayload<JWTPayload>(apiAccessToken);
    const u = userFromPayload(payload);
    if (u) {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      setUser(u);
    }

    return apiAccessToken;
  }, [initKeycloakOnce, keycloak]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
    setUser(null);
    setStatus("loading");
    keycloak.logout();
  }, [keycloak]);

  const ensureAuthenticated = useCallback(async () => {
    if (ensureInFlightRef.current) return ensureInFlightRef.current;

    ensureInFlightRef.current = (async () => {
      setStatus("loading");

      // If stored API token valid, use it
      const info = getStoredTokenInfo();
      if (info.isValid) {
        setUser(info.user);
        setStatus("ready");
        return;
      }

      // Else authenticate again
      await authenticate();
      const info2 = getStoredTokenInfo();
      setUser(info2.user);
      setStatus("ready");
    })()
      .catch((e) => {
        console.error(e);
        try {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        } catch {}
        setUser(null);
        setStatus("error");
      })
      .finally(() => {
        ensureInFlightRef.current = null;
      });

    return ensureInFlightRef.current;
  }, [authenticate]);

  useEffect(() => {
    void ensureAuthenticated();
  }, [ensureAuthenticated]);

  // refresh token near expiry (API token exp is in JWT)
  useEffect(() => {
    if (status !== "ready") return;
    const { expMs, isValid } = getStoredTokenInfo();
    if (!expMs || !isValid) return;

    const skew = 30_000;
    const delay = Math.max(0, expMs - Date.now() - skew);

    const id = window.setTimeout(() => {
      void ensureAuthenticated();
    }, delay);

    return () => window.clearTimeout(id);
  }, [status, ensureAuthenticated]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, authenticate, logout }),
    [user, status, authenticate, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Keycloak from "keycloak-js";
import { getAccessToken as getApiAccessToken } from "@/services/authService";

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

type JWTPayload = Partial<User> & {
  exp?: number;
  sub?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
};

function decodeJwtPayload<T>(token: string): T | null {
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

function userFromPayload(p: JWTPayload | null): User | null {
  if (!p) return null;
  const id =
    (typeof p.id === "string" && p.id) ||
    (typeof p.sub === "string" && p.sub) ||
    "";
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

function getStoredTokenInfo() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const payload = token ? decodeJwtPayload<JWTPayload>(token) : null;
  const expMs = payload?.exp ? payload.exp * 1000 : null;
  const isValid = Boolean(token && expMs && expMs > Date.now());
  return { token, payload, expMs, isValid, user: userFromPayload(payload) };
}

/** ---------------- MOCK PROVIDER (no Keycloak) ---------------- */
function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user: null,
      status: "ready",
      authenticate: async () => {
        // In mock mode we don't authenticate. If some code calls it, fail loudly:
        throw new Error("Auth disabled (missing Keycloak config).");
      },
      logout: () => {},
    }),
    []
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** ---------------- REAL PROVIDER (Keycloak enabled) ---------------- */
function RealAuthProvider({
  children,
  keycloakUrl,
  keycloakRealm,
  keycloakClientId,
}: {
  children: React.ReactNode;
  keycloakUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
}) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  const keycloak = useMemo(
    () =>
      new Keycloak({
        url: keycloakUrl.replace(/\/$/, ""),
        realm: keycloakRealm,
        clientId: keycloakClientId,
      }),
    [keycloakUrl, keycloakRealm, keycloakClientId]
  );

  const keycloakInitPromiseRef = useRef<Promise<boolean> | null>(null);
  const ensureInFlightRef = useRef<Promise<void> | null>(null);

  const initKeycloakOnce = useCallback(() => {
    if (!keycloakInitPromiseRef.current) {
      keycloakInitPromiseRef.current = keycloak.init({
        onLoad: "login-required",
        checkLoginIframe: false,
      });
    }
    return keycloakInitPromiseRef.current;
  }, [keycloak]);

  const authenticate = useCallback(async () => {
    const ok = await initKeycloakOnce();
    if (!ok) throw new Error("Keycloak init failed");

    const keycloakToken = keycloak.token;
    if (!keycloakToken) throw new Error("Missing Keycloak token");

    // Exchange Keycloak token => API access token
    const apiAccessToken = await getApiAccessToken(keycloakToken);

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

      const info = getStoredTokenInfo();
      if (info.isValid) {
        setUser(info.user);
        setStatus("ready");
        return;
      }

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

  // Refresh near expiry (API token exp in JWT)
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

/** ---------------- EXPORT (chooses mock vs real) ---------------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL as string | undefined;
  const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM as string | undefined;
  const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID as
    | string
    | undefined;

  const isPlaceholder = (v: string | undefined) =>
    !v || v.trim() === "" || v.includes("<") || v.includes(">");

  const isValidUrl = (v: string | undefined) => {
    if (!v) return false;
    try {
      // keycloak-js expects a real absolute URL
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isConfigured =
    !isPlaceholder(keycloakUrl) &&
    !isPlaceholder(keycloakRealm) &&
    !isPlaceholder(keycloakClientId) &&
    isValidUrl(keycloakUrl);

  if (!isConfigured) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  return (
    <RealAuthProvider
      keycloakUrl={keycloakUrl!}
      keycloakRealm={keycloakRealm!}
      keycloakClientId={keycloakClientId!}
    >
      {children}
    </RealAuthProvider>
  );
}
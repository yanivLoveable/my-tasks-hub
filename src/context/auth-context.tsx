import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Keycloak from "keycloak-js";
import { APP_ENV } from "@/config";
import { setAuthRetryFn } from "@/services/authRetry";

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

const USER_KEY = "notifCenter.user";

type JWTPayload = Partial<User> & {
  exp?: number;
  sub?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  sAMAccountName?: string;
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

/** ---------------- MOCK PROVIDER (no Keycloak) ---------------- */
function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  const authenticate = useCallback(async () => {
    if (APP_ENV === "dev") {
      const { devAuthenticate } = await import("@/services/devAuth");
      const token = await devAuthenticate();
      const payload = decodeJwtPayload<JWTPayload>(token);
      const u = userFromPayload(payload);
      if (u) setUser(u);
      setStatus("ready");
      return token;
    }
    throw new Error("Auth disabled (missing Keycloak config).");
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {}
    setUser(null);
    setStatus("loading");
  }, []);

  useEffect(() => {
    setAuthRetryFn(authenticate);
    if (APP_ENV === "dev") {
      authenticate().catch((e) => {
        console.error("Dev auth failed:", e);
        setStatus("error");
      });
    } else {
      setStatus("ready");
    }
  }, [authenticate]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, authenticate, logout }),
    [user, status, authenticate, logout]
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

  const initKeycloakOnce = useCallback(() => {
    if (!keycloakInitPromiseRef.current) {
      keycloakInitPromiseRef.current = keycloak.init({
        onLoad: "login-required",
        checkLoginIframe: false,
      });
    }
    return keycloakInitPromiseRef.current;
  }, [keycloak]);

  /** Returns a valid access token, refreshing via keycloak if needed */
  const authenticate = useCallback(async () => {
    const ok = await initKeycloakOnce();
    if (!ok) throw new Error("Keycloak init failed");

    // Use keycloak's built-in refresh: refreshes if token expires within 30s
    try {
      await keycloak.updateToken(30);
    } catch {
      // updateToken failed — force re-login
      keycloak.login();
      throw new Error("Session expired, redirecting to login");
    }

    const token = keycloak.token;
    if (!token) throw new Error("Missing Keycloak token");

    const payload = decodeJwtPayload<JWTPayload>(token);
    const u = userFromPayload(payload);
    if (u) {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      setUser(u);
    }

    return token;
  }, [initKeycloakOnce, keycloak]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {}
    setUser(null);
    setStatus("loading");
    keycloak.logout();
  }, [keycloak]);

  // Bootstrap: init keycloak and get first token
  useEffect(() => {
    setAuthRetryFn(authenticate);

    authenticate()
      .then(() => setStatus("ready"))
      .catch((e) => {
        console.error("Keycloak auth failed:", e);
        setUser(null);
        setStatus("error");
      });
  }, [authenticate]);

  // Proactive refresh: schedule token refresh based on keycloak token exp
  useEffect(() => {
    if (status !== "ready") return;

    const exp = keycloak.tokenParsed?.exp;
    if (!exp) return;

    const skew = 30_000; // refresh 30s before expiry
    const delay = Math.max(0, exp * 1000 - Date.now() - skew);

    const id = window.setTimeout(() => {
      authenticate().catch((e) => console.error("Proactive refresh failed:", e));
    }, delay);

    return () => window.clearTimeout(id);
  }, [status, authenticate, keycloak.tokenParsed?.exp]);

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

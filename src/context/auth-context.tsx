import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Keycloak from "keycloak-js";
import { APP_ENV, KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from "@/config";
import { setAuthRetryFn } from "@/services/authRetry";
import { decodeJwtPayload, userFromPayload, type User, type JWTPayload } from "@/utils/jwt";

export type AuthStatus = "loading" | "ready" | "error";

export type { User } from "@/utils/jwt";

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  authenticate: () => Promise<string>;
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

  const authenticate = useCallback(async () => {
    const ok = await initKeycloakOnce();
    if (!ok) throw new Error("Keycloak init failed");

    try {
      await keycloak.updateToken(30);
    } catch {
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

  useEffect(() => {
    if (status !== "ready") return;

    const exp = keycloak.tokenParsed?.exp;
    if (!exp) return;

    const skew = 30_000;
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
    !isPlaceholder(KEYCLOAK_URL) &&
    !isPlaceholder(KEYCLOAK_REALM) &&
    !isPlaceholder(KEYCLOAK_CLIENT_ID) &&
    isValidUrl(KEYCLOAK_URL);

  if (!isConfigured) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  return (
    <RealAuthProvider
      keycloakUrl={KEYCLOAK_URL}
      keycloakRealm={KEYCLOAK_REALM}
      keycloakClientId={KEYCLOAK_CLIENT_ID}
    >
      {children}
    </RealAuthProvider>
  );
}

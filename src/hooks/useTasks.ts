import { useState, useEffect, useCallback, useRef } from "react";
import { MOCK_TASKS } from "@/data/mockTasks";
import type { Task } from "@/types/task";
import { useAuth } from "@/hooks/use-auth";
//import { fetchUserTasks } from "@/services/tasksService"; //Keycloak-ready
//import { mapApiToTask } from "@/utils/mapTasks"; //Keycloak-ready

const COOLDOWN_KEY = "notifCenter.refreshCooldownUntil";
const COOLDOWN_MS = 10 * 60 * 1000;

export interface BannerMessage {
  type: "error" | "warning" | "success" | "info";
  text: string;
}

export function useTasks() {
  const { isReady, user } = useAuth(); 
  //const { isReady, user ,authenticate } = useAuth(); //Keycloak-ready

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [banner, setBanner] = useState<BannerMessage | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setBanner(null);

      // For now: do NOT call backend. Keep mock tasks.
      // We only enforce "auth ready" so later switching to real API is clean.
      //if (!isReady) return; //Keycloak-ready

      // Optional sanity check (won’t block UI if you prefer):
      // if (!user?.id) setBanner({ type: "warning", text: "מחובר אך חסר userId מה-SSO" });

      await new Promise((r) => setTimeout(r, 300));
      setTasks(MOCK_TASKS);

      //const token = await authenticate(); //Keycloak-ready
      //const apiItems = await fetchUserTasks(token, user.id); //Keycloak-ready
      //setTasks(mapApiToTasks(apiItems)); //Keycloak-ready

      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setBanner({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const getCooldownEnd = (): number => {
    const stored = localStorage.getItem(COOLDOWN_KEY);
    return stored ? parseInt(stored, 10) : 0;
  };

  const isOnCooldown = (): boolean => Date.now() < getCooldownEnd();

  const getCooldownTime = (): string => {
    const end = getCooldownEnd();
    if (end <= Date.now()) return "";
    const d = new Date(end);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const refresh = useCallback(async () => {
    if (!isReady || refreshing) return;
    if (isOnCooldown()) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      setRefreshing(true);
      setBanner({ type: "info", text: "מתבצע רענון נתונים..." });

      // cooldown starts immediately on click
      localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));

      // Mock refresh delay (later replace with triggerRefresh + polling)
      await new Promise((r) => setTimeout(r, 1200));

      setTasks(MOCK_TASKS);
      setLastUpdated(new Date());
      setBanner({ type: "success", text: "הנתונים עודכנו בהצלחה" });

      window.setTimeout(() => {
        setBanner((b) => (b?.type === "success" ? null : b));
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setBanner({ type: "error", text: msg });
    } finally {
      setRefreshing(false);
      abortRef.current = null;
    }
  }, [isReady, refreshing]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return {
    tasks,
    loading,
    refreshing,
    banner,
    setBanner,
    lastUpdated,
    refresh,
    isOnCooldown,
    getCooldownTime,
    loadTasks,
  };
}
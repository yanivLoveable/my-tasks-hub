import { useState, useEffect, useCallback, useRef } from "react";
import { MOCK_TASKS } from "@/data/mockTasks";
// import { getAccessToken } from "@/services/authService";
// import { fetchUserTasks } from "@/services/tasksService";
// import { triggerRefresh } from "@/services/refreshService";
// import { waitForJob } from "@/services/jobsService";
// import { mapApiToTasks } from "@/utils/mapTasks";
import type { Task } from "@/types/task";
const COOLDOWN_KEY = "notifCenter.refreshCooldownUntil";
const COOLDOWN_MS = 10 * 60 * 1000;

export interface BannerMessage {
  type: "error" | "warning" | "success" | "info";
  text: string;
}

export function useTasks() {
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
      // Mock: use static data instead of API
      await new Promise((r) => setTimeout(r, 500));
      setTasks(MOCK_TASKS);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setBanner({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
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
    if (isOnCooldown() || refreshing) return;

    try {
      setRefreshing(true);
      setBanner({ type: "info", text: "מתבצע רענון נתונים..." });

      // Set cooldown
      localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));

      // Mock: simulate refresh delay
      await new Promise((r) => setTimeout(r, 2000));

      setTasks(MOCK_TASKS);
      setLastUpdated(new Date());
      setBanner({ type: "success", text: "הנתונים עודכנו בהצלחה" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setBanner({ type: "error", text: msg });
    } finally {
      setRefreshing(false);
      abortRef.current = null;
    }
  }, [refreshing]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
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

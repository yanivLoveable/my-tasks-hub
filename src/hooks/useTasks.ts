import { useState, useEffect, useCallback, useRef } from "react";
import { getAccessToken } from "@/services/authService";
import { fetchUserTasks } from "@/services/tasksService";
import { triggerRefresh } from "@/services/refreshService";
import { waitForJob } from "@/services/jobsService";
import { mapApiToTasks } from "@/utils/mapTasks";
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
      const token = await getAccessToken();
      const raw = await fetchUserTasks(token);
      const mapped = mapApiToTasks(raw);
      setTasks(mapped);
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

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setRefreshing(true);
      setBanner({ type: "info", text: "מתבצע רענון נתונים..." });

      const token = await getAccessToken();
      const { runId } = await triggerRefresh(token);

      // Set cooldown
      localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));

      const jobResult = await waitForJob(
        token,
        runId,
        undefined,
        controller.signal
      );

      if (jobResult.status === "failed") {
        setBanner({
          type: "error",
          text: jobResult.errorMessage || "הרענון נכשל",
        });
        return;
      }

      // Check per-source statuses
      const sources = jobResult.result?.sources;
      if (sources) {
        const failedSources = Object.entries(sources)
          .filter(([, v]) => v.status === "failed")
          .map(([k]) => k);
        const lockedSources = Object.entries(sources)
          .filter(([, v]) => v.status === "locked")
          .map(([k]) => k);

        if (failedSources.length > 0) {
          setBanner({
            type: "warning",
            text: `הרענון הושלם חלקית. מערכות שנכשלו: ${failedSources.join(", ")}`,
          });
        } else if (lockedSources.length > 0) {
          setBanner({
            type: "warning",
            text: "חלק מהמערכות עסוקות, נסה שוב בעוד רגע",
          });
        } else {
          setBanner({ type: "success", text: "הנתונים עודכנו בהצלחה" });
        }
      } else {
        setBanner({ type: "success", text: "הנתונים עודכנו בהצלחה" });
      }

      // Reload tasks
      const token2 = await getAccessToken();
      const raw = await fetchUserTasks(token2);
      setTasks(mapApiToTasks(raw));
      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
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

import { useState, useEffect, useCallback, useRef } from "react";
import { MOCK_TASKS } from "@/data/mockTasks";
import type { Task } from "@/types/task";
import { useAuth } from "@/hooks/use-auth";
import { fetchUserTasks } from "@/services/tasksService";
import { triggerRefresh } from "@/services/refreshService";
import { waitForJob } from "@/services/jobsService";
import { mapApiToTasks } from "@/utils/mapTasks";
import { APP_ENV } from "@/config";
import {
  isOnRefreshCooldown,
  setRefreshCooldownUntilMs,
  getRefreshCooldownUntilMs,
  REFRESH_COOLDOWN_MS,
} from "@/utils/refreshCooldown";

export interface BannerMessage {
  type: "error" | "warning" | "success" | "info";
  text: string;
}

export function useTasks() {
  const { isReady, user, authenticate } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [banner, setBanner] = useState<BannerMessage | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cooldown, setCooldown] = useState(() => isOnRefreshCooldown());
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Default developer workflow: show mock tasks in dev.
  // Switch to real Keycloak+API mode by setting VITE_APP_ENV to "test" or "prod".
  const shouldUseMock = APP_ENV === "dev" || !user?.id;

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setBanner(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      if (shouldUseMock) {
        await new Promise((r) => setTimeout(r, 300));
        setTasks(MOCK_TASKS);
        setLastUpdated(new Date());
        return;
      }

      const token = await authenticate();
      const apiItems = await fetchUserTasks(token, user.id, abortRef.current.signal);
      setTasks(mapApiToTasks(apiItems));

      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (abortRef.current?.signal.aborted) return;
      const msg = err instanceof Error ? err.message : String(err);
      setBanner({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  }, [authenticate, shouldUseMock, user?.id]);

  useEffect(() => {
    // In real API mode we need auth ready; in mock mode we should not block UI.
    if (!shouldUseMock && !isReady) return;
    void loadTasks();
  }, [isReady, shouldUseMock, loadTasks]);

  // Start a timer to clear cooldown reactively
  const startCooldownTimer = useCallback((durationMs: number) => {
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    setCooldown(true);
    cooldownTimerRef.current = setTimeout(() => {
      setCooldown(false);
      cooldownTimerRef.current = null;
    }, durationMs);
  }, []);

  // On mount, if there's an existing cooldown, schedule its expiry
  useEffect(() => {
    const remaining = getRefreshCooldownUntilMs() - Date.now();
    if (remaining > 0) {
      startCooldownTimer(remaining);
    } else {
      setCooldown(false);
    }
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [startCooldownTimer]);

  const getCooldownTime = (): string => {
    const end = getRefreshCooldownUntilMs();
    if (end <= Date.now()) return "";
    const d = new Date(end);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const refresh = useCallback(async () => {
    if ((!shouldUseMock && !isReady) || refreshing) return;
    if (isOnCooldown()) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      setRefreshing(true);

      // cooldown starts immediately on click
      setRefreshCooldownUntilMs(Date.now() + REFRESH_COOLDOWN_MS);

      if (shouldUseMock) {
        await new Promise((r) => setTimeout(r, 1200));
        setTasks(MOCK_TASKS);
      } else {
        const token = await authenticate();
        const res = await triggerRefresh(token, user!.id);
        const job = await waitForJob(token, res.runId, undefined, abortRef.current.signal);
        if (job.status === "failed") {
          throw new Error(job.errorMessage || "רענון נכשל");
        }
        const apiItems = await fetchUserTasks(token, user!.id, abortRef.current.signal);
        setTasks(mapApiToTasks(apiItems));
      }

      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (abortRef.current?.signal.aborted) return;
      const msg = err instanceof Error ? err.message : String(err);
      setBanner({ type: "error", text: msg });
    } finally {
      setRefreshing(false);
      abortRef.current = null;
    }
  }, [authenticate, isReady, startCooldownTimer, refreshing, shouldUseMock, user?.id]);

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
import { useState, useEffect, useCallback, useRef } from "react";
import { MOCK_SETS } from "@/data/mockTaskSets";
import type { Task } from "@/types/task";

const AUTO_REFRESH_INTERVAL_MS = 2 * 60 * 1000;
const USER_ACTIVITY_TIMEOUT_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"];

import { useAuth } from "@/hooks/use-auth";
import { fetchUserTasks } from "@/services/tasksService";
import { mapApiToTasks } from "@/utils/mapTasks";
import { APP_ENV } from "@/config";

export interface BannerMessage {
  type: "error" | "warning" | "success" | "info";
  text: string;
}

export function useTasks() {
  const { isReady, user, authenticate } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<BannerMessage | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [failedSystems, setFailedSystems] = useState<Record<string, Date>>({});

  const mockIndexRef = useRef(-1);
  const abortRef = useRef<AbortController | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const shouldUseMock = APP_ENV === "dev";

  // Track user activity
  useEffect(() => {
    const mark = () => {
      lastActivityRef.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((e) => document.addEventListener(e, mark, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((e) => document.removeEventListener(e, mark));
    };
  }, []);

  const isUserActive = useCallback(() => {
    return Date.now() - lastActivityRef.current < USER_ACTIVITY_TIMEOUT_MS;
  }, []);

  const hasLoadedOnce = useRef(false);

  const loadTasks = useCallback(async () => {
    try {
      if (!hasLoadedOnce.current) {
        setLoading(true);
      }
      setBanner(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      if (shouldUseMock) {
        await new Promise((r) => setTimeout(r, 300));
        mockIndexRef.current = (mockIndexRef.current + 1) % MOCK_SETS.length;
        setTasks(MOCK_SETS[mockIndexRef.current]);
        setLastUpdated(new Date());
        return;
      }

      const token = await authenticate();
      const { items: apiItems, sources } = await fetchUserTasks(token, abortRef.current.signal);
      setTasks(mapApiToTasks(apiItems));

      // Detect per-source failures from sources metadata
      const failed: Record<string, Date> = {};
      for (const [sys, info] of Object.entries(sources)) {
        if (info.refresh.lastAttemptAt !== info.refresh.lastSuccessAt) {
          failed[sys] = new Date(info.refresh.lastAttemptAt);
        }
      }
      setFailedSystems(failed);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (abortRef.current?.signal.aborted) return;
      const msg = err instanceof Error ? err.message : String(err);
      setBanner({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  }, [authenticate, shouldUseMock]);

  useEffect(() => {
    if (!shouldUseMock && !isReady) return;
    void loadTasks();
  }, [isReady, shouldUseMock, loadTasks]);

  // --- Auto-refresh: GET every 5 minutes, only if user is active ---
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && isUserActive()) {
        void loadTasks();
      }
    }, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadTasks, isUserActive]);

  // --- Auto-refresh: GET on tab focus ---
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      void loadTasks();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadTasks]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return {
    tasks,
    loading,
    banner,
    setBanner,
    lastUpdated,
    loadTasks,
    failedSystems,
  };
}

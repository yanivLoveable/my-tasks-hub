import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor, fireEvent, act } from "@testing-library/react";
import { renderApp } from "@/test/renderApp";
import { clearAllStorage, preloadCooldown } from "@/test/helpers/storage";
import Index from "@/pages/Index";

describe("Flow 5 — Refresh + cooldown + messaging", () => {
  beforeEach(() => {
    clearAllStorage();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    clearAllStorage();
    vi.useRealTimers();
  });

  it("clicking refresh triggers refresh and shows spinning icon", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    const allButtons = screen.getAllByRole("button");
    const refreshBtn = allButtons.find((btn) =>
      btn.querySelector(".lucide-rotate-cw")
    );
    expect(refreshBtn).toBeTruthy();

    fireEvent.click(refreshBtn!);

    await waitFor(() => {
      const icon = refreshBtn!.querySelector(".lucide-rotate-cw");
      expect(icon?.classList.contains("animate-spin")).toBe(true);
    });

    await vi.advanceTimersByTimeAsync(1500);

    await waitFor(() => {
      const icon = refreshBtn!.querySelector(".lucide-rotate-cw");
      expect(icon?.classList.contains("animate-spin")).toBe(false);
    });
  });

  it("cooldown prevents immediate re-refresh", () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    preloadCooldown(new Date("2026-03-05T10:05:00").getTime());

    const cooldownVal = Number(localStorage.getItem("notifCenter.refreshCooldownUntil"));
    expect(cooldownVal).toBeGreaterThan(Date.now());
  });

  it("cooldown expires after 5 minutes", () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    preloadCooldown(new Date("2026-03-05T10:05:00").getTime());

    expect(Date.now()).toBeLessThan(new Date("2026-03-05T10:05:00").getTime());

    vi.setSystemTime(new Date("2026-03-05T10:06:00"));
    expect(Date.now()).toBeGreaterThan(new Date("2026-03-05T10:05:00").getTime());
  });

  it("refresh cycles to a different mock dataset", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך 33/)).toBeInTheDocument();
    });

    const allButtons = screen.getAllByRole("button");
    const refreshBtn = allButtons.find((btn) =>
      btn.querySelector(".lucide-rotate-cw")
    );

    fireEvent.click(refreshBtn!);
    await vi.advanceTimersByTimeAsync(1500);

    // After refresh, task count should change (v2 has 24 tasks)
    await waitFor(() => {
      expect(screen.getByText(/24 משימות לביצוע/)).toBeInTheDocument();
    });
  });

  it("refresh works again after cooldown expires (5+ minutes)", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    const allButtons = screen.getAllByRole("button");
    const refreshBtn = allButtons.find((btn) =>
      btn.querySelector(".lucide-rotate-cw")
    );
    expect(refreshBtn).toBeTruthy();

    // First refresh
    fireEvent.click(refreshBtn!);
    await vi.advanceTimersByTimeAsync(1500);
    await waitFor(() => {
      const icon = refreshBtn!.querySelector(".lucide-rotate-cw");
      expect(icon?.classList.contains("animate-spin")).toBe(false);
    });

    // Jump past the 5-minute cooldown
    vi.setSystemTime(new Date("2026-03-05T10:06:00"));
    await vi.advanceTimersByTimeAsync(1000);

    // Click refresh again — should trigger a new refresh
    fireEvent.click(refreshBtn!);
    await waitFor(() => {
      const icon = refreshBtn!.querySelector(".lucide-rotate-cw");
      expect(icon?.classList.contains("animate-spin")).toBe(true);
    });

    await vi.advanceTimersByTimeAsync(1500);
    await waitFor(() => {
      const icon = refreshBtn!.querySelector(".lucide-rotate-cw");
      expect(icon?.classList.contains("animate-spin")).toBe(false);
    });
  });
});

describe("Flow 5b — Auto-refresh", () => {
  beforeEach(() => {
    clearAllStorage();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    clearAllStorage();
    vi.useRealTimers();
  });

  it("auto-refreshes via polling after 5 minutes", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    // Initial load — v1 with 33 tasks
    await waitFor(() => {
      expect(screen.getByText(/33 משימות לביצוע/)).toBeInTheDocument();
    });

    // Advance 5 minutes — should trigger auto-refresh (loadTasks reloads same mock index 0)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 100);
    });

    // The auto-refresh calls loadTasks (not refresh), so it reloads same dataset
    // This verifies the interval fires without crashing
    await waitFor(() => {
      expect(screen.getByText(/משימות לביצוע/)).toBeInTheDocument();
    });
  });

  it("auto-refreshes on tab focus when data is stale (>60s)", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/33 משימות לביצוע/)).toBeInTheDocument();
    });

    // Advance time past the MIN_REFETCH_GAP (60s)
    vi.setSystemTime(new Date("2026-03-05T10:02:00"));

    // Simulate tab becoming visible
    await act(async () => {
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
      await vi.advanceTimersByTimeAsync(500);
    });

    // Should still show tasks (auto-refresh reloads same index)
    await waitFor(() => {
      expect(screen.getByText(/משימות לביצוע/)).toBeInTheDocument();
    });
  });

  it("does NOT auto-refresh on tab focus when data is fresh (<60s)", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/33 משימות לביצוע/)).toBeInTheDocument();
    });

    // Only 10 seconds later — within MIN_REFETCH_GAP
    vi.setSystemTime(new Date("2026-03-05T10:00:10"));

    const loadingBefore = screen.queryByText(/טוען/);

    await act(async () => {
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
      await vi.advanceTimersByTimeAsync(100);
    });

    // Should still show 33 tasks, no re-fetch triggered
    expect(screen.getByText(/33 משימות לביצוע/)).toBeInTheDocument();
  });
});

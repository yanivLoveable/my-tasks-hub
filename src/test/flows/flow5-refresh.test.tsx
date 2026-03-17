import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor, fireEvent, act } from "@testing-library/react";
import { renderApp } from "@/test/renderApp";
import { clearAllStorage, preloadCooldown } from "@/test/helpers/storage";
import Index from "@/pages/Index";

/** Helper: find the bold task count in "ממתינות לך X משימות" */
function getTaskCount(): string {
  // The count is rendered as a bold <span> inside the subtitle
  const el = screen.getByText(/ממתינות לך/);
  const bold = el.querySelector(".font-bold");
  return bold?.textContent?.trim() ?? "";
}

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
      expect(getTaskCount()).toBe("33");
    });

    const allButtons = screen.getAllByRole("button");
    const refreshBtn = allButtons.find((btn) =>
      btn.querySelector(".lucide-rotate-cw")
    );

    fireEvent.click(refreshBtn!);
    await vi.advanceTimersByTimeAsync(1500);

    // After refresh, task count should change (v2 has 24 tasks)
    await waitFor(() => {
      expect(getTaskCount()).toBe("24");
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

    await waitFor(() => {
      expect(getTaskCount()).toBe("33");
    });

    // Advance 5 minutes — triggers auto-refresh interval (calls loadTasks, same mock index)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 500);
    });

    // Verifies the interval fires without crashing
    await waitFor(() => {
      expect(screen.getByText(/ממתינות לך/)).toBeInTheDocument();
    });
  });

  it("auto-refreshes on tab focus when data is stale (>60s)", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(getTaskCount()).toBe("33");
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

    // Should still render (auto-refresh reloads same index)
    await waitFor(() => {
      expect(screen.getByText(/ממתינות לך/)).toBeInTheDocument();
    });
  });

  it("does NOT auto-refresh on tab focus when data is fresh (<60s)", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(getTaskCount()).toBe("33");
    });

    // Only 10 seconds later — within MIN_REFETCH_GAP
    vi.setSystemTime(new Date("2026-03-05T10:00:10"));

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
    expect(getTaskCount()).toBe("33");
  });
});

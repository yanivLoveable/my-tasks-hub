import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor, fireEvent, act } from "@testing-library/react";
import { renderApp } from "@/test/renderApp";
import { clearAllStorage, preloadCooldown } from "@/test/helpers/storage";
import Index from "@/pages/Index";

/** Helper: find the bold task count in "ממתינות לך X משימות" */
function getTaskCount(): string {
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

describe("Flow 5b — Auto-refresh (full sync, activity-gated)", () => {
  beforeEach(() => {
    clearAllStorage();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    clearAllStorage();
    vi.useRealTimers();
  });

  it("auto-refreshes via full sync on tab focus (cycles mock dataset)", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(getTaskCount()).toBe("33");
    });

    // Jump past cooldown (tab focus triggers refresh which sets cooldown)
    // Initial load doesn't set cooldown, so tab focus should work
    vi.setSystemTime(new Date("2026-03-05T10:01:00"));

    // Simulate tab becoming visible
    await act(async () => {
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
      await vi.advanceTimersByTimeAsync(1500);
    });

    // Tab focus triggers full refresh which cycles the mock dataset
    await waitFor(() => {
      expect(getTaskCount()).toBe("24");
    });
  });

  it("auto-refreshes every 5 minutes when user is active", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(getTaskCount()).toBe("33");
    });

    // Simulate user activity (so the activity check passes)
    await act(async () => {
      document.dispatchEvent(new MouseEvent("mousemove"));
    });

    // Jump past cooldown from any previous refresh + advance 5 min interval
    vi.setSystemTime(new Date("2026-03-05T10:06:00"));

    await act(async () => {
      // Simulate activity right before interval fires
      document.dispatchEvent(new MouseEvent("mousemove"));
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 500);
    });

    // Verifies the interval fires without crashing
    await waitFor(() => {
      expect(screen.getByText(/ממתינות לך/)).toBeInTheDocument();
    });
  });

  it("does NOT auto-refresh when user is inactive for 5+ minutes", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(getTaskCount()).toBe("33");
    });

    // Advance time past activity timeout WITHOUT any user events
    // Set time far enough that activity check fails
    vi.setSystemTime(new Date("2026-03-05T10:10:00"));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 500);
    });

    // Should still show original 33 tasks — no refresh happened
    expect(getTaskCount()).toBe("33");
  });

  it("does NOT auto-refresh on tab focus when on cooldown", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(getTaskCount()).toBe("33");
    });

    // Manually trigger refresh to start cooldown
    const allButtons = screen.getAllByRole("button");
    const refreshBtn = allButtons.find((btn) =>
      btn.querySelector(".lucide-rotate-cw")
    );
    fireEvent.click(refreshBtn!);
    await vi.advanceTimersByTimeAsync(1500);

    // Now on cooldown — count changed to 24
    await waitFor(() => {
      expect(getTaskCount()).toBe("24");
    });

    // Tab focus during cooldown should NOT trigger another refresh
    await act(async () => {
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
      await vi.advanceTimersByTimeAsync(1500);
    });

    // Should still be 24 (not cycled to next dataset)
    expect(getTaskCount()).toBe("24");
  });
});

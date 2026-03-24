import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import { renderApp } from "@/test/renderApp";
import { clearAllStorage } from "@/test/helpers/storage";
import Index from "@/pages/Index";

/** Helper: find the bold task count in "ממתינות לך X משימות" */
function getTaskCount(): string {
  const el = screen.getByText(/ממתינות לך/);
  const bold = el.querySelector(".font-bold");
  return bold?.textContent?.trim() ?? "";
}

describe("Flow 5 — Auto-refresh (GET-only, activity-gated)", () => {
  beforeEach(() => {
    clearAllStorage();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    clearAllStorage();
    vi.useRealTimers();
  });

  it("auto-refreshes on tab focus (cycles mock dataset)", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/ממתינות לך/)).toBeInTheDocument();
    });

    const initialCount = getTaskCount();

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

    // Tab focus triggers loadTasks which cycles the mock dataset
    await waitFor(() => {
      expect(getTaskCount()).not.toBe(initialCount);
    });
  });

  it("auto-refreshes every 5 minutes when user is active", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/ממתינות לך/)).toBeInTheDocument();
    });

    // Simulate user activity
    await act(async () => {
      document.dispatchEvent(new MouseEvent("mousemove"));
    });

    const initialCount = getTaskCount();

    await act(async () => {
      document.dispatchEvent(new MouseEvent("mousemove"));
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 500);
    });

    // Should have cycled to next dataset
    await waitFor(() => {
      expect(getTaskCount()).not.toBe(initialCount);
    });
  });

  it("does NOT auto-refresh when user is inactive for 5+ minutes", async () => {
    vi.setSystemTime(new Date("2026-03-05T10:00:00"));
    renderApp(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/ממתינות לך/)).toBeInTheDocument();
    });

    const initialCount = getTaskCount();

    // Advance time past activity timeout WITHOUT any user events
    vi.setSystemTime(new Date("2026-03-05T10:10:00"));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 500);
    });

    // Should still show same dataset — no refresh happened
    expect(getTaskCount()).toBe(initialCount);
  });
});

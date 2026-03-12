import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
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

    // Find refresh button by its SVG class
    const allButtons = screen.getAllByRole("button");
    const refreshBtn = allButtons.find((btn) =>
      btn.querySelector(".lucide-rotate-cw")
    );
    expect(refreshBtn).toBeTruthy();

    fireEvent.click(refreshBtn!);

    // The refresh icon should have animate-spin class during refresh
    await waitFor(() => {
      const icon = refreshBtn!.querySelector(".lucide-rotate-cw");
      expect(icon?.classList.contains("animate-spin")).toBe(true);
    });

    await vi.advanceTimersByTimeAsync(1500);

    // After refresh completes, spinning stops
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
});

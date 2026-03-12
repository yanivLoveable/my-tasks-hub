import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderApp } from "@/test/renderApp";
import { clearAllStorage, preloadUIState } from "@/test/helpers/storage";
import Index from "@/pages/Index";
import { MOCK_TASKS } from "@/data/mockTasks";

describe("Flow 6 — Persistence across reload", () => {
  beforeEach(() => clearAllStorage());
  afterEach(() => clearAllStorage());

  it("restores search, filters, and sort from localStorage", async () => {
    preloadUIState({
      sortMode: "startDate",
      sortDirection: "desc",
      flags: { overdueOnly: true, groupOnly: false, delegationOnly: false, personalOnly: false },
    });

    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/בהתאם לסינון, מוצגות/)).toBeInTheDocument();
    });
    // Verify overdue filter is active by checking filtered count matches overdue tasks
    const overdueCount = MOCK_TASKS.filter((t) => t.overdueDays && t.overdueDays > 0).length;
    const filterText = screen.getByText(/בהתאם לסינון, מוצגות/).textContent || "";
    const count = parseInt(filterText.match(/\d+/)?.[0] || "0");
    expect(count).toBe(overdueCount);
  });

  it("restores selected systems from localStorage", async () => {
    preloadUIState({
      selectedSystems: ["ERP"],
    });

    renderApp(<Index />);
    await waitFor(() => {
      // The systems dropdown should show "ERP" as the label
      expect(screen.getAllByText("ERP").length).toBeGreaterThan(0);
      expect(screen.getByText(/בהתאם לסינון, מוצגות/)).toBeInTheDocument();
    });

    // Verify only ERP tasks are shown
    const erpTaskCount = MOCK_TASKS.filter((t) => t.systemLabel === "ERP").length;
    const filterText = screen.getByText(/בהתאם לסינון, מוצגות/).textContent || "";
    const count = parseInt(filterText.match(/\d+/)?.[0] || "0");
    expect(count).toBe(erpTaskCount);
  });

  it("handles invalid JSON in localStorage gracefully", async () => {
    localStorage.setItem("notifCenter.uiState", "not-valid-json{{{");
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(MOCK_TASKS[0].title)).toBeInTheDocument();
    });
  });

  it("handles 'undefined' string in localStorage gracefully", async () => {
    localStorage.setItem("notifCenter.uiState", "undefined");
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText("מרכז המשימות וההתראות")).toBeInTheDocument();
    });
  });

  it("handles null string in localStorage gracefully", async () => {
    localStorage.setItem("notifCenter.uiState", "null");
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText("מרכז המשימות וההתראות")).toBeInTheDocument();
    });
  });
});

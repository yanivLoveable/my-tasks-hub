import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderApp } from "@/test/renderApp";
import { clearAllStorage, preloadUIState } from "@/test/helpers/storage";
import Index from "@/pages/Index";
import { MOCK_TASKS } from "@/data/mockTasks";

function getFilterCount(): number {
  const el = screen.getByText(/בהתאם לסינון, מוצגות/);
  const text = el.textContent || "";
  return parseInt(text.match(/\d+/)?.[0] || "0");
}

function expectFilterVisible() {
  const el = screen.getByText(/בהתאם לסינון, מוצגות/);
  expect(el).toHaveClass("opacity-100");
}

function expectFilterHidden() {
  const el = screen.getByText(/בהתאם לסינון, מוצגות/);
  expect(el).toHaveClass("opacity-0");
}

describe("Flow 3 — Filters flow", () => {
  beforeEach(() => clearAllStorage());
  afterEach(() => clearAllStorage());

  it("filters by overdue flag", async () => {
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("חורגות"));

    const overdueTasks = MOCK_TASKS.filter((t) => t.overdueDays && t.overdueDays > 0);
    await waitFor(() => {
      expectFilterVisible();
      expect(getFilterCount()).toBe(overdueTasks.length);
    });
  });

  it("filters by system via preloaded state", async () => {
    preloadUIState({ selectedSystems: ["ERP"] });
    renderApp(<Index />);

    const erpTasks = MOCK_TASKS.filter((t) => t.systemLabel === "ERP");
    await waitFor(() => {
      expectFilterVisible();
      expect(getFilterCount()).toBe(erpTasks.length);
    });
  });

  it("filters by group flag", async () => {
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("קבוצה"));

    await waitFor(() => {
      const groupTasks = MOCK_TASKS.filter((t) => !!t.groupName);
      expectFilterVisible();
      expect(getFilterCount()).toBe(groupTasks.length);
    });
  });

  it("clears all filters with נקה הכל button", async () => {
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("חורגות"));
    await waitFor(() => {
      expectFilterVisible();
    });

    fireEvent.click(screen.getByText("נקה הכל"));
    await waitFor(() => {
      expectFilterHidden();
    });
  });

  it("combines overdue + personal filters", async () => {
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("חורגות"));
    fireEvent.click(screen.getByText("אישי"));

    await waitFor(() => {
      const combined = MOCK_TASKS.filter(
        (t) => (t.overdueDays && t.overdueDays > 0) && !t.groupName && !t.delegatedFrom
      );
      expectFilterVisible();
      expect(getFilterCount()).toBe(combined.length);
    });
  });

  it("filters by multiple systems via preloaded state", async () => {
    preloadUIState({ selectedSystems: ["ERP", "JIRA"] });
    renderApp(<Index />);

    const expected = MOCK_TASKS.filter((t) => t.systemLabel === "ERP" || t.systemLabel === "JIRA");
    await waitFor(() => {
      expectFilterVisible();
      expect(getFilterCount()).toBe(expected.length);
    });
  });
});

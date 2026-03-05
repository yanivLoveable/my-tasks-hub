import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderApp } from "@/test/renderApp";
import { clearAllStorage, preloadUIState } from "@/test/helpers/storage";
import Index from "@/pages/Index";
import { MOCK_TASKS } from "@/data/mockTasks";

describe("Flow 3 — Filters flow", () => {
  beforeEach(() => clearAllStorage());
  afterEach(() => clearAllStorage());

  it("filters by overdue flag", async () => {
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("חורגות"));

    await waitFor(() => {
      expect(screen.getByText(/בהתאם לסינון, מוצגות/)).toBeInTheDocument();
    });

    const overdueTasks = MOCK_TASKS.filter((t) => t.overdueDays && t.overdueDays > 0);
    const text = screen.getByText(/בהתאם לסינון, מוצגות/).textContent || "";
    const count = parseInt(text.match(/\d+/)?.[0] || "0");
    expect(count).toBe(overdueTasks.length);
  });

  it("filters by system via preloaded state", async () => {
    preloadUIState({ selectedSystems: ["ERP"] });
    renderApp(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/בהתאם לסינון, מוצגות/)).toBeInTheDocument();
    });

    const erpTasks = MOCK_TASKS.filter((t) => t.systemLabel === "ERP");
    const text = screen.getByText(/בהתאם לסינון, מוצגות/).textContent || "";
    const count = parseInt(text.match(/\d+/)?.[0] || "0");
    expect(count).toBe(erpTasks.length);
  });

  it("filters by group flag", async () => {
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("קבוצה"));

    await waitFor(() => {
      const groupTasks = MOCK_TASKS.filter((t) => !!t.groupName);
      const text = screen.getByText(/בהתאם לסינון, מוצגות/).textContent || "";
      const count = parseInt(text.match(/\d+/)?.[0] || "0");
      expect(count).toBe(groupTasks.length);
    });
  });

  it("clears all filters with נקה הכל button", async () => {
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("חורגות"));
    await waitFor(() => {
      expect(screen.getByText(/בהתאם לסינון, מוצגות/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("נקה הכל"));
    await waitFor(() => {
      expect(screen.queryByText(/בהתאם לסינון, מוצגות/)).not.toBeInTheDocument();
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
      const text = screen.getByText(/בהתאם לסינון, מוצגות/).textContent || "";
      const count = parseInt(text.match(/\d+/)?.[0] || "0");
      expect(count).toBe(combined.length);
    });
  });

  it("filters by multiple systems via preloaded state", async () => {
    preloadUIState({ selectedSystems: ["ERP", "JIRA"] });
    renderApp(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/בהתאם לסינון, מוצגות/)).toBeInTheDocument();
    });

    const expected = MOCK_TASKS.filter((t) => t.systemLabel === "ERP" || t.systemLabel === "JIRA");
    const text = screen.getByText(/בהתאם לסינון, מוצגות/).textContent || "";
    const count = parseInt(text.match(/\d+/)?.[0] || "0");
    expect(count).toBe(expected.length);
  });
});

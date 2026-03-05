import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderApp } from "@/test/renderApp";
import { clearAllStorage } from "@/test/helpers/storage";
import Index from "@/pages/Index";
import { MOCK_TASKS } from "@/data/mockTasks";

describe("Flow 2 — Search flow", () => {
  beforeEach(() => clearAllStorage());
  afterEach(() => clearAllStorage());

  it("filters by title text", async () => {
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("חיפוש לפי כותרת, מזהה או תאריך...");
    fireEvent.change(searchInput, { target: { value: "אישור תקציב שנתי" } });

    await waitFor(() => {
      expect(screen.getByText("אישור תקציב שנתי למחלקה")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("תיאום פגישת צוות רבעונית")).not.toBeInTheDocument();
    });
  });

  it("filters by task identifier", async () => {
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("חיפוש לפי כותרת, מזהה או תאריך...");
    fireEvent.change(searchInput, { target: { value: "JIRA-778899" } });

    await waitFor(() => {
      expect(screen.getByText("סקירת דרישות לפרויקט דיגיטציה")).toBeInTheDocument();
    });
  });

  it("clears search and restores full list", async () => {
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("חיפוש לפי כותרת, מזהה או תאריך...");
    fireEvent.change(searchInput, { target: { value: "JIRA-778899" } });

    await waitFor(() => {
      expect(screen.getByText("סקירת דרישות לפרויקט דיגיטציה")).toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: "" } });

    await waitFor(() => {
      expect(screen.getByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
    });
  });
});

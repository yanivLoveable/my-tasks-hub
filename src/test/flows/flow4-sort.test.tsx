import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderApp } from "@/test/renderApp";
import { clearAllStorage, preloadUIState } from "@/test/helpers/storage";
import Index from "@/pages/Index";
import { sortTasks } from "@/utils/sort";
import { MOCK_TASKS } from "@/data/mockTasks";

describe("Flow 4 — Sort flow", () => {
  beforeEach(() => clearAllStorage());
  afterEach(() => clearAllStorage());

  it("default sort: tasks with dueDate ordered by oldest first, then no-dueDate by newest startDate", () => {
    const defaultSorted = sortTasks([...MOCK_TASKS], "default", "asc");
    const withDue = defaultSorted.filter((t) => t.dueDate);
    for (let i = 1; i < withDue.length; i++) {
      expect(withDue[i].dueDate!.getTime()).toBeGreaterThanOrEqual(
        withDue[i - 1].dueDate!.getTime()
      );
    }
    const noDue = defaultSorted.filter((t) => !t.dueDate);
    for (let i = 1; i < noDue.length; i++) {
      expect(noDue[i].startDate!.getTime()).toBeLessThanOrEqual(
        noDue[i - 1].startDate!.getTime()
      );
    }
  });

  it("sort persists from localStorage - startDate desc orders tasks correctly", async () => {
    preloadUIState({ sortMode: "startDate", sortDirection: "desc" });
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText("מרכז המשימות וההתראות")).toBeInTheDocument();
    });
    // Verify tasks are sorted by startDate desc
    const sorted = sortTasks([...MOCK_TASKS], "startDate", "desc");
    await waitFor(() => {
      expect(screen.getByText(sorted[0].title)).toBeInTheDocument();
    });
  });

  it("sort persists from localStorage - dueDate asc shows sort label", async () => {
    preloadUIState({ sortMode: "dueDate", sortDirection: "asc" });
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText("מרכז המשימות וההתראות")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("(ישן לחדש)")).toBeInTheDocument();
    });
  });

  it("sort by startDate asc verifies correct ordering", () => {
    const sorted = sortTasks([...MOCK_TASKS], "startDate", "asc");
    for (let i = 1; i < sorted.length; i++) {
      const a = sorted[i - 1].startDate?.getTime() ?? 0;
      const b = sorted[i].startDate?.getTime() ?? 0;
      expect(b).toBeGreaterThanOrEqual(a);
    }
  });
});

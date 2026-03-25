import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderApp } from "@/test/renderApp";
import { clearAllStorage } from "@/test/helpers/storage";
import Index from "@/pages/Index";
import { MOCK_TASKS } from "@/data/mockTasks";
import { sortTasks } from "@/utils/sort";

describe("Flow 1 — Initial load + baseline UI", () => {
  beforeEach(() => clearAllStorage());
  afterEach(() => clearAllStorage());

  it("renders RTL layout with header elements", async () => {
    renderApp(<Index />);
    // Logo is now an SVG with split text "Y" + "ANIV"
    expect(await screen.findByText("ANIV")).toBeInTheDocument();
    expect(screen.getByText("מרכז המשימות וההתראות")).toBeInTheDocument();
  });

  it("loads and displays tasks after loading state", async () => {
    renderApp(<Index />);
    const sorted = sortTasks([...MOCK_TASKS], "default", "asc");
    expect(await screen.findByText(sorted[0].title)).toBeInTheDocument();
  });

  it("shows pagination with total items count", async () => {
    renderApp(<Index />);
    expect(await screen.findByText(/מציג 1-20 מתוך/)).toBeInTheDocument();
  });

  it("shows total tasks count in controls bar", async () => {
    renderApp(<Index />);
    expect(await screen.findByText(String(MOCK_TASKS.length))).toBeInTheDocument();
  });

  it("task card contains required fields (title, identifier, system label)", async () => {
    renderApp(<Index />);
    const sorted = sortTasks([...MOCK_TASKS], "default", "asc");
    const firstTask = sorted[0];
    expect(await screen.findByText(firstTask.title)).toBeInTheDocument();
    expect(screen.getByText(firstTask.identifier)).toBeInTheDocument();
    expect(screen.getAllByText(firstTask.systemLabel).length).toBeGreaterThan(0);
  });
});
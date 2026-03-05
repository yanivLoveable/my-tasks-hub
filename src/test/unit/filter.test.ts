import { describe, it, expect } from "vitest";
import { filterTasks } from "@/utils/filter";
import type { Task, UIState } from "@/types/task";
import { DEFAULT_UI_STATE } from "@/types/task";

const tasks: Task[] = [
  { id: "1", source: "ERP", systemLabel: "ERP", title: "Task A", identifier: "ERP-1", url: "#", category: "רכש וכספים", overdueDays: 5, groupName: "G1", startDate: new Date("2026-01-01") },
  { id: "2", source: "DOCS", systemLabel: "DOCS", title: "Task B", identifier: "DOCS-2", url: "#", category: "משפטי", delegatedFrom: "Someone", startDate: new Date("2026-02-01") },
  { id: "3", source: "JIRA", systemLabel: "JIRA", title: "Task C", identifier: "JIRA-3", url: "#", category: "IT", startDate: new Date("2026-03-01") },
];

function makeState(partial: Partial<UIState> = {}): UIState {
  return { ...DEFAULT_UI_STATE, ...partial };
}

describe("filterTasks", () => {
  it("returns all tasks with default state", () => {
    expect(filterTasks(tasks, makeState())).toHaveLength(3);
  });

  it("filters by selectedSystems", () => {
    const result = filterTasks(tasks, makeState({ selectedSystems: ["ERP"] }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by multiple systems", () => {
    const result = filterTasks(tasks, makeState({ selectedSystems: ["ERP", "JIRA"] }));
    expect(result).toHaveLength(2);
  });

  it("filters by selectedTopics", () => {
    const result = filterTasks(tasks, makeState({ selectedTopics: ["IT"] }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("filters by overdueOnly flag", () => {
    const result = filterTasks(tasks, makeState({ flags: { ...DEFAULT_UI_STATE.flags, overdueOnly: true } }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by groupOnly flag", () => {
    const result = filterTasks(tasks, makeState({ flags: { ...DEFAULT_UI_STATE.flags, groupOnly: true } }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by delegationOnly flag", () => {
    const result = filterTasks(tasks, makeState({ flags: { ...DEFAULT_UI_STATE.flags, delegationOnly: true } }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters by personalOnly flag", () => {
    const result = filterTasks(tasks, makeState({ flags: { ...DEFAULT_UI_STATE.flags, personalOnly: true } }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("filters by search query on title", () => {
    const result = filterTasks(tasks, makeState({ searchQuery: "Task A" }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by search query on identifier", () => {
    const result = filterTasks(tasks, makeState({ searchQuery: "JIRA-3" }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("combines system + overdue filters (intersection)", () => {
    const result = filterTasks(tasks, makeState({
      selectedSystems: ["ERP", "JIRA"],
      flags: { ...DEFAULT_UI_STATE.flags, overdueOnly: true },
    }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});

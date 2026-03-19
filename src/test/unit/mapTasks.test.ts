import { describe, it, expect } from "vitest";
import { mapApiToTask, mapApiToTasks } from "@/utils/mapTasks";
import type { ApiWorkItem } from "@/types/api";

describe("mapApiToTask", () => {
  const baseItem: ApiWorkItem = {
    source: "ERP",
    externalId: "ERP-001",
    updatedAt: "2026-01-15T10:00:00Z",
    title: "Test Task",
    taskId: "T-001",
    url: "https://erp.example.com/task/1",
    status: "open",
    priority: "high",
    assignmentDate: "2026-01-15T10:00:00",
    dueDate: "2026-02-15T10:00:00",
    categoryDesc: "Finance",
    category: null,
    subCategory: null,
    subCategoryDesc: null,
    taskType: null,
    assignedToRole: null,
  };

  it("maps source to correct systemLabel", () => {
    expect(mapApiToTask(baseItem).systemLabel).toBe("ERP");
    expect(mapApiToTask({ ...baseItem, source: "DOCS_APPROVAL" }).systemLabel).toBe("DOCS");
    expect(mapApiToTask({ ...baseItem, source: "SNOW_TICKET" }).systemLabel).toBe("SNOW");
    expect(mapApiToTask({ ...baseItem, source: "CRM" }).systemLabel).toBe("CRM");
    expect(mapApiToTask({ ...baseItem, source: "JIRA" }).systemLabel).toBe("JIRA");
    expect(mapApiToTask({ ...baseItem, source: "UNKNOWN_SYS" }).systemLabel).toBe("UNKNOWN_SYS");
  });

  it("maps title and identifier", () => {
    const result = mapApiToTask(baseItem);
    expect(result.title).toBe("Test Task");
    expect(result.identifier).toBe("T-001");
  });

  it("falls back to externalId when taskId missing", () => {
    const item = { ...baseItem, taskId: undefined };
    expect(mapApiToTask(item).identifier).toBe("ERP-001");
  });

  it("parses dates correctly", () => {
    const result = mapApiToTask(baseItem);
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.dueDate).toBeInstanceOf(Date);
  });

  it("maps category from categoryDesc", () => {
    expect(mapApiToTask(baseItem).category).toBe("Finance");
  });

  it("maps empty source to OTHER", () => {
    const item = { ...baseItem, source: "" };
    expect(mapApiToTask(item).systemLabel).toBe("OTHER");
  });
});

describe("mapApiToTasks", () => {
  it("maps array of items", () => {
    const items: ApiWorkItem[] = [
      { source: "ERP", externalId: "1", updatedAt: "", title: "A" },
      { source: "CRM", externalId: "2", updatedAt: "", title: "B" },
    ];
    const result = mapApiToTasks(items);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("A");
    expect(result[1].title).toBe("B");
  });
});

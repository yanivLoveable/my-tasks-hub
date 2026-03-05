import { describe, it, expect } from "vitest";
import { sortTasks } from "@/utils/sort";
import type { Task } from "@/types/task";

const makeTasks = (): Task[] => [
  { id: "1", source: "A", systemLabel: "A", title: "T1", identifier: "1", url: "#", startDate: new Date("2026-01-01"), dueDate: new Date("2026-03-01") },
  { id: "2", source: "A", systemLabel: "A", title: "T2", identifier: "2", url: "#", startDate: new Date("2026-02-01"), dueDate: new Date("2026-02-01") },
  { id: "3", source: "A", systemLabel: "A", title: "T3", identifier: "3", url: "#", startDate: new Date("2026-03-01"), dueDate: null },
  { id: "4", source: "A", systemLabel: "A", title: "T4", identifier: "4", url: "#", startDate: new Date("2026-01-15") },
];

describe("sortTasks", () => {
  it("default: dueDate asc, then no-dueDate by startDate desc", () => {
    const result = sortTasks(makeTasks(), "default", "asc");
    // Tasks with dueDate first, ordered asc
    expect(result[0].id).toBe("2"); // dueDate 2026-02-01
    expect(result[1].id).toBe("1"); // dueDate 2026-03-01
    // Then no-dueDate tasks by startDate desc
    expect(result[2].id).toBe("3"); // startDate 2026-03-01
    expect(result[3].id).toBe("4"); // startDate 2026-01-15
  });

  it("startDate asc", () => {
    const result = sortTasks(makeTasks(), "startDate", "asc");
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("4");
  });

  it("startDate desc", () => {
    const result = sortTasks(makeTasks(), "startDate", "desc");
    expect(result[0].id).toBe("3");
  });

  it("dueDate asc puts no-dueDate at end (Infinity)", () => {
    const result = sortTasks(makeTasks(), "dueDate", "asc");
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("1");
    // no-dueDate tasks at end
    expect(result[result.length - 1].dueDate).toBeFalsy();
  });

  it("dueDate desc puts no-dueDate at start (Infinity desc)", () => {
    const result = sortTasks(makeTasks(), "dueDate", "desc");
    // Infinity values come first in desc
    expect(result[0].dueDate).toBeFalsy();
  });
});

import type { Task, UIState } from "@/types/task";
import { formatDateHebrew } from "./dates";

export function filterTasks(tasks: Task[], state: UIState): Task[] {
  let result = tasks;

  // System filter (multi-select)
  if (state.selectedSystems.length > 0) {
    const set = new Set(state.selectedSystems);
    result = result.filter((t) => set.has(t.systemLabel));
  }

  // Topic filter (multi-select)
  if (state.selectedTopics.length > 0) {
    const set = new Set(state.selectedTopics);
    result = result.filter((t) => t.category && set.has(t.category));
  }

  // Flags
  if (state.flags.overdueOnly) {
    result = result.filter((t) => t.overdueDays && t.overdueDays > 0);
  }

  if (state.flags.groupOnly) {
    result = result.filter((t) => !!t.assignedToRole);
  }

  // Search
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.trim().toLowerCase();
    result = result.filter((t) => {
      const fields = [
        t.title,
        t.identifier,
        t.startDate ? formatDateHebrew(t.startDate) : "",
        t.dueDate ? formatDateHebrew(t.dueDate) : "",
      ];
      return fields.some((f) => f.toLowerCase().includes(q));
    });
  }

  return result;
}

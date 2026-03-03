import type { Task, UIState } from "@/types/task";
import { formatDateHebrew } from "./dates";

export function filterTasks(tasks: Task[], state: UIState): Task[] {
  let result = tasks;

  // System filter
  if (state.selectedSystem !== "all") {
    result = result.filter(
      (t) => t.systemLabel === state.selectedSystem
    );
  }

  // Topic filter
  if (state.selectedTopic !== "all") {
    result = result.filter((t) => t.category === state.selectedTopic);
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

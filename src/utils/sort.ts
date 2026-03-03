import type { Task, SortMode, SortDirection } from "@/types/task";

export function sortTasks(
  tasks: Task[],
  mode: SortMode,
  direction: SortDirection
): Task[] {
  const sorted = [...tasks];

  if (mode === "default") {
    return sorted.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      // Both no dueDate: sort by startDate desc
      const aStart = a.startDate?.getTime() ?? 0;
      const bStart = b.startDate?.getTime() ?? 0;
      return bStart - aStart;
    });
  }

  const getVal = (t: Task) => {
    if (mode === "startDate") return t.startDate?.getTime() ?? 0;
    return t.dueDate?.getTime() ?? Infinity;
  };

  return sorted.sort((a, b) => {
    const va = getVal(a);
    const vb = getVal(b);
    return direction === "asc" ? va - vb : vb - va;
  });
}

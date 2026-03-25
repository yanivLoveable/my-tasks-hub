import { MOCK_TASKS } from "./mockTasks";
import type { Task } from "@/types/task";

/**
 * Mock dataset v2 — same as v1 but with the first 4 tasks removed.
 */
export const MOCK_TASKS_V2: Task[] = MOCK_TASKS.slice(4);

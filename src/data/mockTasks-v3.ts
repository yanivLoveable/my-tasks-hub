import { MOCK_TASKS_V2 } from "./mockTasks-v2";
import type { Task } from "@/types/task";

/**
 * Mock dataset v3 — same as v2 plus 2 additional new tasks.
 */
const NEW_TASKS: Task[] = [
  {
    id: "ERP-400001", source: "ERP", systemLabel: "ERP",
    title: "סקירת תקציב פרויקט תשתיות", identifier: "ERP-400001", url: "#",
    status: "open", priority: "medium",
    startDate: new Date("2026-03-12"), dueDate: new Date("2026-04-15"),
    category: "רכש וכספים", assignedToRole: "צוות מאשרי שכר", groupName: "צוות מאשרי שכר",
    updatedAt: new Date("2026-03-12"),
  },
  {
    id: "JIRA-400005", source: "JIRA", systemLabel: "JIRA",
    title: "פיתוח API לאינטגרציה חדשה", identifier: "JIRA-400005", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-03-14"), dueDate: new Date("2026-03-28"),
    category: "IT", assignedToRole: "IT", groupName: "צוות דיגיטציה",
    updatedAt: new Date("2026-03-14"),
  },
];

export const MOCK_TASKS_V3: Task[] = [...MOCK_TASKS_V2, ...NEW_TASKS];

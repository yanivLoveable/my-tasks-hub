import type { ApiWorkItem } from "@/types/api";
import type { Task } from "@/types/task";
import { parseDate, parseDateNullable, getOverdueDays } from "./dates";
import { rewriteTaskUrl, APP_ENV } from "@/config";

function deriveSystemLabel(source: string): string {
  if (!source) return "OTHER";
  const upper = source.toUpperCase();
  if (upper.includes("DOCS") || upper.includes("APPROVAL")) return "DOCS";
  if (upper.includes("SNOW")) return "SNOW";
  if (upper.includes("ERP")) return "ERP";
  if (upper.includes("CRM")) return "CRM";
  if (upper.includes("JIRA")) return "JIRA";
  return upper;
}

export function mapApiToTask(item: ApiWorkItem): Task {
  const systemLabel = deriveSystemLabel(item.source);
  const url = item.url
    ? rewriteTaskUrl(item.url, systemLabel, APP_ENV)
    : "";

  const startDate = parseDate(item.assignmentDate);
  const dueDate = parseDateNullable(item.dueDate);
  const overdueDays = getOverdueDays(dueDate);

  return {
    id: item.externalId,
    source: item.source,
    systemLabel,
    title: item.title || "",
    identifier: item.taskId || item.externalId,
    url,
    status: item.status ?? undefined,
    priority: item.priority ?? undefined,
    startDate,
    dueDate,
    category:
      item.categoryDesc ||
      item.category ||
      item.taskType ||
      item.subCategoryDesc ||
      item.subCategory ||
      undefined,
    assignedToRole: item.assignedToRole ?? undefined,
    updatedAt: parseDate(item.updatedAt),
    overdueDays: overdueDays > 0 ? overdueDays : undefined,
  };
}

export function mapApiToTasks(items: ApiWorkItem[]): Task[] {
  return items.map(mapApiToTask);
}

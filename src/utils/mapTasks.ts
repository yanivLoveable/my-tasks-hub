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
  const p = item.payload || {};
  const systemLabel = deriveSystemLabel(item.source);
  const url = p.url
    ? rewriteTaskUrl(p.url as string, systemLabel, APP_ENV)
    : "";

  const startDate = parseDate(p.assigmentDate as string);
  const dueDate = parseDateNullable(p.dueDate as string);
  const overdueDays = getOverdueDays(dueDate);

  return {
    id: item.external_id,
    source: item.source,
    systemLabel,
    title: (p.title as string) || "",
    identifier: (p.taskID as string) || item.external_id,
    url,
    status: p.status as string | undefined,
    priority: p.priority as string | undefined,
    startDate,
    dueDate,
    category:
      (p.categoryDesc as string) ||
      (p.category as string) ||
      (p.taskType as string) ||
      (p.subCategoryDesc as string) ||
      (p.subCategory as string) ||
      undefined,
    assignedToRole: p.assignedToRole as string | undefined,
    updatedAt: parseDate(item.updated_at),
    overdueDays: overdueDays > 0 ? overdueDays : undefined,
  };
}

export function mapApiToTasks(items: ApiWorkItem[]): Task[] {
  return items.map(mapApiToTask);
}

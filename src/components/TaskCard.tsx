import type { Task } from "@/types/task";
import { formatDateHebrew } from "@/utils/dates";
import { Calendar, AlertTriangle, ExternalLink } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

const SYSTEM_COLORS: Record<string, string> = {
  ERP: "bg-blue-100 text-blue-800",
  SNOW: "bg-emerald-100 text-emerald-800",
  DOCS: "bg-purple-100 text-purple-800",
  CRM: "bg-amber-100 text-amber-800",
  JIRA: "bg-sky-100 text-sky-800",
};

export default function TaskCard({ task }: TaskCardProps) {
  const handleClick = () => {
    if (task.url) {
      window.open(task.url, "_blank", "noopener,noreferrer");
    }
  };

  const systemColor =
    SYSTEM_COLORS[task.systemLabel] || "bg-secondary text-secondary-foreground";

  return (
    <div
      className="group bg-background border border-border rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Right side: content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md ${systemColor}`}
            >
              {task.systemLabel}
            </span>
            {task.category && (
              <span className="text-[11px] text-muted-foreground">
                {task.category}
              </span>
            )}
            {task.identifier && (
              <span className="text-[11px] text-muted-foreground font-mono">
                #{task.identifier}
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-foreground leading-snug mb-2 line-clamp-2">
            {task.title}
          </h3>

          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            {task.startDate && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                נפתח: {formatDateHebrew(task.startDate)}
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                יעד: {formatDateHebrew(task.dueDate)}
              </span>
            )}
            {task.status && (
              <span className="text-muted-foreground">{task.status}</span>
            )}
          </div>
        </div>

        {/* Left side: overdue + link icon */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {task.overdueDays && task.overdueDays > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-overdue text-[11px] font-bold rounded-md">
              <AlertTriangle size={12} />
              חריגה: {task.overdueDays} ימים
            </span>
          )}
          <ExternalLink
            size={14}
            className="text-muted-foreground/40 group-hover:text-primary transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

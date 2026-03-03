import type { Task } from "@/types/task";
import { formatDateHebrew } from "@/utils/dates";
import { ExternalLink, Users } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const handleClick = () => {
    if (task.url) {
      window.open(task.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="group bg-background border border-border rounded-xl px-5 py-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      dir="rtl"
    >
      <div className="flex items-start gap-4">
        {/* Right side: System badge */}
        <div className="flex-shrink-0 pt-1">
          <span className="inline-flex items-center justify-center min-w-[48px] px-3 py-1.5 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground">
            {task.systemLabel}
          </span>
        </div>

        {/* Center: Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: title + identifier */}
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[15px] font-bold text-foreground leading-snug">
              {task.title}
            </h3>
            {task.identifier && (
              <span className="text-[12px] text-muted-foreground font-mono whitespace-nowrap">
                {task.identifier}
              </span>
            )}
          </div>

          {/* Row 2: category + dates + overdue */}
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground mt-1">
            {task.category && (
              <span className="font-medium">{task.category}</span>
            )}
            {task.startDate && (
              <span>פתיחה: {formatDateHebrew(task.startDate)}</span>
            )}
            {task.dueDate && (
              <span>יעד: {formatDateHebrew(task.dueDate)}</span>
            )}
            {task.overdueDays && task.overdueDays > 0 && (
              <>
                <span className="text-muted-foreground">|</span>
                <span className="text-overdue font-bold">
                  חריגה: {task.overdueDays} ימים
                </span>
              </>
            )}
          </div>

          {/* Row 3: group info */}
          {task.assignedToRole && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1.5">
              <Users size={12} />
              <span>{task.assignedToRole}</span>
            </div>
          )}
        </div>

        {/* Left side: External link icon */}
        <div className="flex items-start pt-2 flex-shrink-0">
          <ExternalLink
            size={18}
            className="text-muted-foreground/50 group-hover:text-primary transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

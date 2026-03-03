import type { Task } from "@/types/task";
import { formatDateHebrew } from "@/utils/dates";
import { ExternalLink } from "lucide-react";

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
      className="flex items-center gap-[15px] bg-background border border-border rounded-lg px-[18px] py-[10px] cursor-pointer hover:border-primary/30 transition-[border-color] duration-150"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      dir="rtl"
      style={{ fontFamily: "Assistant, sans-serif" }}
    >
      {/* System badge - square box */}
      <div
        className="w-[44px] h-[44px] flex-shrink-0 bg-secondary border border-border rounded-md flex items-center justify-center font-bold text-[10px] text-primary tracking-[0.04em] text-center leading-tight break-all"
      >
        {task.systemLabel}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: title + identifier */}
        <div className="flex items-baseline gap-2 mb-[5px] flex-wrap">
          <span className="text-[16px] font-bold text-foreground leading-[1.3] line-clamp-2 break-words">
            {task.title}
          </span>
          {task.identifier && (
            <span className="text-[11px] font-mono text-muted-foreground flex-shrink-0 select-none">
              {task.identifier}
            </span>
          )}
        </div>

        {/* Row 2: category + dates + overdue */}
        <div className="flex items-center gap-[10px] flex-wrap text-[12px] text-muted-foreground">
          {task.category && (
            <span className="bg-secondary text-secondary-foreground font-bold rounded px-[7px] py-[1px] text-[11px]">
              {task.category}
            </span>
          )}
          {task.startDate && (
            <span>פתיחה: {formatDateHebrew(task.startDate)}</span>
          )}
          {task.dueDate && (
            <span>יעד: {formatDateHebrew(task.dueDate)}</span>
          )}
          {task.overdueDays && task.overdueDays > 0 && (
            <span className="text-overdue font-bold">
              | חריגה: {task.overdueDays} ימים
            </span>
          )}
        </div>
      </div>

      {/* External link button - circle */}
      <button
        title="פתח משימה"
        className="w-[34px] h-[34px] flex-shrink-0 bg-info/15 border-none rounded-full flex items-center justify-center cursor-pointer hover:bg-info/25 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <ExternalLink size={15} strokeWidth={2.5} className="text-primary" />
      </button>
    </div>
  );
}

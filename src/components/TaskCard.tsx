import { useState, useCallback } from "react";
import type { Task } from "@/types/task";
import { formatDateHebrew } from "@/utils/dates";
import { ExternalLink, ArrowLeftRight, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskCardProps {
  task: Task;
}

const isDocs = (source: string) =>
  source === "DOCS_APPROVAL" || source === "DOCS";

export default function TaskCard({ task }: TaskCardProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (task.url) {
      window.open(task.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyId = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.identifier) return;
    navigator.clipboard.writeText(task.identifier).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [task.identifier]);

  const showCategory = !isDocs(task.source) && !!task.category;
  const hasMetaLine = !!task.delegatedFrom || !!task.groupName;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="flex items-center gap-[15px] bg-background border border-border rounded-lg px-[18px] py-[10px] cursor-pointer hover:border-primary/30 hover:shadow-md hover:-translate-y-[2px] transition-all duration-150"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        dir="rtl"
        style={{ fontFamily: "Assistant, sans-serif" }}
      >
        {/* System badge - square box */}
        <div className="w-[44px] h-[44px] flex-shrink-0 bg-secondary border border-border rounded-md flex items-center justify-center font-bold text-[10px] text-primary tracking-[0.04em] text-center leading-tight break-all">
          {task.systemLabel}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: title */}
          <div className="mb-[3px]">
            <span className="text-[14px] font-bold text-foreground leading-[1.3] line-clamp-2 break-words">
              {task.title}
            </span>
          </div>

          {/* Row 2: identifier + category + dates + overdue */}
          <div className="flex items-center gap-[10px] flex-wrap text-[12px] text-muted-foreground">
            {task.identifier && (
              <Tooltip open={copied ? true : undefined}>
                <TooltipTrigger asChild>
                  <span
                    className="text-[11px] font-mono text-muted-foreground select-none cursor-pointer hover:text-primary transition-colors"
                    onClick={handleCopyId}
                  >
                    {task.identifier}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" dir="rtl" className="text-[11px]" key={copied ? "copied" : "default"}>
                  {copied ? "הועתק!" : "לחץ להעתקה"}
                </TooltipContent>
              </Tooltip>
            )}
            {showCategory && (
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
              <span className="text-alert-red font-bold">
                | חריגה: {task.overdueDays} ימים
              </span>
            )}
          </div>

          {/* Row 3: metadata - delegation & group */}
          {hasMetaLine && (
            <div className="flex items-center gap-[10px] flex-wrap text-[11px] text-muted-foreground/60 mt-[4px]">
              {task.delegatedFrom && (
                <span className="flex items-center gap-1">
                  <ArrowLeftRight size={12} className="flex-shrink-0" />
                  הועבר מ-{task.delegatedFrom}
                </span>
              )}
              {task.delegatedFrom && task.groupName && (
                <span className="text-muted-foreground/30">|</span>
              )}
              {task.groupName && (
                <span className="flex items-center gap-1">
                  <Users size={12} className="flex-shrink-0" />
                  קבוצת {task.groupName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* External link button - solid circle */}
        <button
          title="פתח משימה"
          className="w-[34px] h-[34px] aspect-square flex-shrink-0 bg-task-action border-none rounded-full flex items-center justify-center cursor-pointer hover:bg-task-action-hover transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <ExternalLink size={14} strokeWidth={2.5} className="text-white" />
        </button>
      </div>
    </TooltipProvider>
  );
}

import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";
import { SearchX } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

function SkeletonCard() {
  return (
    <div className="bg-background border border-border rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex gap-2 mb-2">
            <div className="h-4 w-12 bg-secondary rounded" />
            <div className="h-4 w-20 bg-secondary rounded" />
          </div>
          <div className="h-4 w-3/4 bg-secondary rounded mb-2" />
          <div className="h-3 w-1/2 bg-secondary rounded" />
        </div>
      </div>
    </div>
  );
}

export default function TaskList({ tasks, loading, hasActiveFilters, onClearFilters }: TaskListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground" dir="rtl">
        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-5">
          <SearchX size={26} className="text-muted-foreground/50" />
        </div>
        <p className="text-[14px] font-semibold text-muted-foreground">
          לא נמצאו משימות התואמות את הסינון הנבחר
        </p>
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-5 h-9 px-6 rounded-lg border border-primary text-primary text-[13px] font-semibold hover:bg-primary/5 transition-colors"
          >
            נקה סינונים
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id}>
          <TaskCard task={task} />
        </div>
      ))}
    </div>
  );
}

import type { Task } from "@/types/task";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
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

export default function TaskList({ tasks, loading }: TaskListProps) {
  if (loading) {
    return (
      <div className="space-y-2 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-semibold">אין משימות להצגה</p>
        <p className="text-sm mt-1">נסה לשנות את הסינון או החיפוש</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

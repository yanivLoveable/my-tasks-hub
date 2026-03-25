import { useState, useEffect, useRef } from "react";
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
  const prevIdsRef = useRef<Set<string>>(new Set());
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set());
  const [exitingTasks, setExitingTasks] = useState<Task[]>([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (loading) return;

    const currentIds = new Set(tasks.map((t) => t.id));
    const prevIds = prevIdsRef.current;

    // On first render with data, don't animate anything
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevIdsRef.current = currentIds;
      return;
    }

    // Find new tasks (in current but not in previous)
    const added = new Set<string>();
    currentIds.forEach((id) => {
      if (!prevIds.has(id)) added.add(id);
    });

    // Find removed tasks (in previous but not in current)
    const removedIds = new Set<string>();
    prevIds.forEach((id) => {
      if (!currentIds.has(id)) removedIds.add(id);
    });

    if (added.size > 0) {
      setNewTaskIds(added);
    }

    // For removed tasks, we need their Task objects from the previous render
    // We store them temporarily for the exit animation
    if (removedIds.size > 0) {
      // We can't access old task objects here, so we store removedIds
      // and reconstruct minimal exit placeholders
      setExitingTasks((prev) => prev); // trigger handled below
    }

    prevIdsRef.current = currentIds;

    // Clear "new" status after animation completes
    if (added.size > 0) {
      const timer = setTimeout(() => setNewTaskIds(new Set()), 300);
      return () => clearTimeout(timer);
    }
  }, [tasks, loading]);

  // Track previous tasks for exit animation
  const prevTasksRef = useRef<Task[]>([]);

  useEffect(() => {
    if (loading) return;

    const currentIds = new Set(tasks.map((t) => t.id));
    const removed = prevTasksRef.current.filter((t) => !currentIds.has(t.id));

    if (removed.length > 0) {
      setExitingTasks(removed);
      const timer = setTimeout(() => setExitingTasks([]), 300);
      return () => clearTimeout(timer);
    }

    prevTasksRef.current = tasks;
  }, [tasks, loading]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0 && exitingTasks.length === 0) {
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
      {/* Exiting tasks (animating out) */}
      {exitingTasks.map((task) => (
        <div key={`exit-${task.id}`} className="animate-task-exit">
          <TaskCard task={task} />
        </div>
      ))}
      {/* Current tasks */}
      {tasks.map((task) => (
        <div
          key={task.id}
          className={newTaskIds.has(task.id) ? "animate-task-enter opacity-0" : ""}
        >
          <TaskCard task={task} />
        </div>
      ))}
    </div>
  );
}

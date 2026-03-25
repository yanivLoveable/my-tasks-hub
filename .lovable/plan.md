

# Per-Task Enter/Exit Animations (Only New & Removed Tasks Animate)

## Problem

Currently every task card re-runs the entrance animation on every render — when filters change, when refreshing, etc. The entire list "flashes." You want only **newly added** tasks to animate in and **removed** tasks to animate out, while existing tasks stay put.

## Root Cause

The animation class `animate-task-enter` is applied unconditionally to every card. React re-renders all cards and each one replays the animation.

## Approach

Track which task IDs are **new** vs **existing** vs **removed** using a `useRef` that stores the previous task ID set. On each render, diff the current IDs against the previous ones. Only new tasks get the entrance animation; removed tasks get a brief exit animation before being removed from the DOM.

## Changes

### 1. `src/components/TaskList.tsx` — Diff-based animation logic

- Add a `useRef<Set<string>>` to store the previous set of task IDs
- Add a `useState<Task[]>` for "exiting tasks" (tasks being animated out)
- On each render (via `useEffect`), compare new task IDs vs previous:
  - **New IDs** → mark them in a `newTaskIds` set → apply `animate-task-enter` only to those
  - **Removed IDs** → add them to an "exiting" list with `animate-task-exit` → remove from DOM after animation ends (~300ms timeout)
  - **Existing IDs** → render normally, no animation class
- Update the ref after diffing
- Remove the staggered `animationDelay` (no longer relevant since only individual cards animate)

### 2. `tailwind.config.ts` — Add exit animation

- Add `task-exit` keyframe: fade-out + slide-left over 250ms
- Add `animate-task-exit` animation class with `forwards` fill mode

### 3. `src/hooks/useTasks.ts` — Skip loading skeleton on refresh

- Currently `loadTasks` sets `loading = true` which shows skeletons, wiping out the list. This defeats per-task animations.
- Add a flag: only set `loading = true` on the **first** load. Subsequent refreshes keep the old list visible while fetching, then swap in the new data (triggering the diff logic).
- Add `isInitialLoad` ref, set `loading = true` only when `tasks` is empty.

| File | Change |
|------|--------|
| `src/components/TaskList.tsx` | Track previous task IDs via ref, diff to determine new/removed/existing, apply animations only to new/removed cards |
| `tailwind.config.ts` | Add `task-exit` keyframe and animation |
| `src/hooks/useTasks.ts` | Only show loading skeleton on first load, not on refresh |


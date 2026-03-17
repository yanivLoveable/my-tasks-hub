

## Plan: Multiple Mock Datasets for Visible Refresh Changes

### Idea
Create 2-3 separate mock data files that simulate different "snapshots" of task data. Each time you click refresh, the app cycles to the next dataset — so you can visually confirm the refresh worked (tasks change, counts update, new items appear/disappear).

### What gets created

**`src/data/mockTasks-v2.ts`** — A second dataset with differences from the original:
- Some tasks removed (simulating completed tasks)
- Some new tasks added (simulating newly assigned tasks)
- Some existing tasks with changed priority, status, or overdueDays
- ~25 tasks total

**`src/data/mockTasks-v3.ts`** — A third dataset with further variations:
- Different mix of systems and categories
- A few urgent/critical tasks added
- ~28 tasks total

**`src/data/mockTaskSets.ts`** — A barrel file that exports an array of all datasets:
```ts
export const MOCK_SETS = [MOCK_TASKS_V1, MOCK_TASKS_V2, MOCK_TASKS_V3];
```

### What gets changed

**`src/hooks/useTasks.ts`**
- Import `MOCK_SETS` instead of `MOCK_TASKS`
- Add a `useRef` counter (`mockIndexRef`) that tracks which dataset to use
- On initial load: use index 0 (original data)
- On refresh (mock mode): increment index (wrapping around), load the next dataset
- Everything else stays the same — cooldown, spinner, popover all remain

### No files deleted
The original `mockTasks.ts` stays as-is and becomes "v1" of the rotation.

### Result
Clicking refresh in dev mode will cycle through 3 different task lists, letting you visually verify that the refresh mechanism works — different task counts, different priorities, different systems appearing/disappearing.


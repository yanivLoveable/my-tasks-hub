

# Align Codebase with Real API Contract

## Recommended Architecture

Based on your API explanation:

- **Initial load + auto-refresh**: Use `GET /user-tasks` (reads from PostgreSQL — fast, always has data)
- **Manual refresh button**: Use Option 2 — `POST /refresh` → poll `GET /jobs/runs/{runId}` → then `GET /user-tasks` to get the updated DB data
- **No need for the live endpoint** — Option 2 stores data to PostgreSQL which is what `/user-tasks` reads from, so the flow is complete

This gives instant first paint (DB already has data from the backend's scheduled syncs) and detailed per-source feedback on manual refresh.

## Changes

### 1. Update API types (`src/types/api.ts`)

Replace the nested `payload`-based `ApiWorkItem` with a **flat structure** matching the real JSON. Add the response envelope type with `metadata`, `data[]`, and `sources`.

Key field renames: `external_id` → `externalId`, `updated_at` → `updatedAt`, `payload.taskID` → `taskId`, `payload.assigmentDate` → `assignmentDate`.

Update `RefreshResponse` to include `userId`, `status`. Update `JobRunResponse` to use `result.statuses` (Record of string values) instead of `result.sources`.

### 2. Update task mapper (`src/utils/mapTasks.ts`)

Remove `payload` nesting — read all fields directly from the flat item (`item.title`, `item.taskId`, `item.url`, `item.assignmentDate`, etc.).

### 3. Update tasks service (`src/services/tasksService.ts`)

- The HTTP GET now returns `{ metadata, data, sources }` envelope, not a raw array
- Add `limit=200&offset=0` query params
- Return `{ items: ApiWorkItem[], sources }` so the hook can use `sources` to detect per-system sync failures (compare `lastAttemptAt` vs `lastSuccessAt`)

### 4. Update polling config (`src/services/jobsService.ts`)

- Change poll interval from 1s → **30s**
- Change timeout from 30s → **5 minutes** (300s)

### 5. Update hook (`src/hooks/useTasks.ts`)

- In `loadTasks()`: destructure `{ items, sources }` from the service; use `sources` to populate `failedSystems` by comparing `lastAttemptAt !== lastSuccessAt`
- In `refresh()`: read `job.result.statuses` (string values like `"succeeded"`, `"failed"`) instead of `job.result.sources`

### 6. Update tests (`src/test/unit/mapTasks.test.ts`)

Update test fixtures to use the new flat `ApiWorkItem` shape (remove `payload`, use `externalId`, `taskId`, `assignmentDate`, etc.).

## Files Modified

1. `src/types/api.ts`
2. `src/utils/mapTasks.ts`
3. `src/services/tasksService.ts`
4. `src/services/jobsService.ts`
5. `src/hooks/useTasks.ts`
6. `src/test/unit/mapTasks.test.ts`


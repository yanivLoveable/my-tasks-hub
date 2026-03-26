

## Fix: Failed source tooltip should show `lastSuccessAt`

### Problem
When a source fails to refresh, the `failedSystems` record stores `lastAttemptAt` (line 78 in `useTasks.ts`). The tooltip on the filter chip says "סונכרן לאחרונה ב-..." but shows the failed attempt time instead of the last **successful** sync time.

### Change

**File: `src/hooks/useTasks.ts`** (line 78)
- Change `failed[sys] = new Date(info.refresh.lastAttemptAt)` → `failed[sys] = new Date(info.refresh.lastSuccessAt)`

This single-line fix ensures the tooltip displays when the source **last successfully synced**, which is the meaningful information for the user.

Everything else (the warning icon on the filter chip, the tooltip text in `FiltersBar.tsx`) is already correctly wired — only the stored date value is wrong.


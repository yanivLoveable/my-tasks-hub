

# Simplify Refresh: Backend-Only Sync, Remove Refresh Button, Move Identifier

## Summary

Three changes:
1. **Auto-refresh becomes GET-only** — no more `triggerRefresh` / `waitForJob` from the frontend. The backend handles syncing on its own schedule. The frontend just calls `loadTasks` (GET `/user-tasks`) every 5 min for active users, and on tab focus.
2. **Remove the refresh button** entirely from the header.
3. **Move task identifier** from its own line to the start of the dates line.

## Changes

### 1. `src/hooks/useTasks.ts` — Remove full sync, simplify to GET-only

- Remove imports: `triggerRefresh`, `waitForJob`, `jobsService`, `refreshService`
- Remove all cooldown logic (`isOnRefreshCooldown`, `setRefreshCooldownUntilMs`, `getRefreshCooldownUntilMs`, `REFRESH_COOLDOWN_MS`, `cooldown` state, `cooldownTimerRef`, `startCooldownTimer`, `getCooldownTime`)
- Replace `refresh()` with a simple wrapper around `loadTasks()` that sets `refreshing` state (for the mock spinner path, keep the mock cycling behavior)
- The 5-min interval calls `loadTasks()` (activity-gated, same as now)
- Tab focus calls `loadTasks()` (no cooldown check needed)
- Remove from return: `refresh`, `cooldown`, `getCooldownTime`, `refreshing` — only keep `loadTasks`, `failedSystems` detection stays (read from GET response sources metadata)

### 2. `src/components/Header.tsx` — Remove refresh button

- Remove `RefreshPopover` import and usage
- Remove props: `onRefresh`, `refreshing`, `cooldown`, `cooldownTime`
- Remove the divider `<div className="w-px h-4 bg-border" />` that separated refresh from other buttons
- Keep: lastUpdated display, partial failure warning, feedback button, info button

### 3. `src/pages/Index.tsx` — Remove refresh-related props

- Stop passing `onRefresh`, `refreshing`, `cooldown`, `cooldownTime` to `Header`
- Remove `refresh`, `cooldown`, `getCooldownTime`, `refreshing` from `useTasks()` destructuring

### 4. `src/components/TaskCard.tsx` — Move identifier to dates line

- Remove the standalone "Row 1b: identifier" block (lines 65-82)
- Add the identifier (with tooltip/copy) as the first element inside "Row 2" (the dates/category line), before the category badge
- Keep the same styling: `text-[11px] font-mono text-muted-foreground` with click-to-copy tooltip

### 5. Delete dead files

- `src/components/RefreshPopover.tsx` — no longer used
- `src/services/refreshService.ts` — `triggerRefresh` and `pollJobStatus` no longer called from frontend
- `src/services/jobsService.ts` — `waitForJob` no longer called
- `src/utils/refreshCooldown.ts` — cooldown logic removed

### 6. Clean up types

- `src/types/api.ts` — remove `RefreshResponse` and `JobRunResponse` types if they exist only for the refresh flow

### 7. Update tests — `src/test/flows/flow5-refresh.test.tsx`

- Remove all tests that reference the refresh button (`lucide-rotate-cw`)
- Remove cooldown-related tests
- Keep/rewrite the auto-refresh tests:
  - "auto-refreshes on tab focus" — verify `loadTasks` is called (mock dataset cycles via the mock path in `loadTasks`)
  - "auto-refreshes every 5 min when active" — same logic, just calls `loadTasks`
  - "does NOT auto-refresh when inactive" — keep as-is
- The mock cycling behavior currently lives in `refresh()` — move it to `loadTasks()` for the mock path so tests can verify dataset cycling on auto-refresh

### 8. Update `src/test/helpers/storage.ts`

- Remove `preloadCooldown` helper if it exists solely for cooldown tests

---

## File summary

| File | Action |
|------|--------|
| `src/hooks/useTasks.ts` | Remove sync flow, cooldown; auto-refresh calls `loadTasks` |
| `src/components/Header.tsx` | Remove RefreshPopover and related props |
| `src/pages/Index.tsx` | Remove refresh/cooldown props |
| `src/components/TaskCard.tsx` | Move identifier to start of dates line |
| `src/components/RefreshPopover.tsx` | Delete |
| `src/services/refreshService.ts` | Delete |
| `src/services/jobsService.ts` | Delete |
| `src/utils/refreshCooldown.ts` | Delete |
| `src/types/api.ts` | Remove `RefreshResponse`, `JobRunResponse` if unused |
| `src/test/flows/flow5-refresh.test.tsx` | Rewrite: remove button/cooldown tests, keep activity-gated auto-refresh tests |
| `src/test/helpers/storage.ts` | Remove `preloadCooldown` if dead |


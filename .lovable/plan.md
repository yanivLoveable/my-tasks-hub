
# Fix Auth Refresh, Auto-Refresh Logic, Remove userId from API Calls

## Status: ✅ Implemented

### Changes Made

1. **`src/context/auth-context.tsx`** — `authenticate()` now calls `keycloak.updateToken(30)` to refresh token via refresh_token. Proactive timer uses `keycloak.tokenParsed?.exp`. Removed localStorage token caching for real auth.

2. **`src/services/tasksService.ts`** — Removed `userId` param from `fetchUserTasks()`.

3. **`src/services/refreshService.ts`** — Removed `userId` param from `triggerRefresh()`.

4. **`src/hooks/useTasks.ts`** — Removed `userId` from all API calls. Auto-refresh now triggers full sync (`refresh()`) instead of just `loadTasks()`. Added user activity tracking (mousemove, keydown, click, scroll, touchstart). 5-min interval only fires if user was active. Tab focus triggers full sync respecting cooldown.

5. **`src/types/api.ts`** — Removed `userId` from `RefreshResponse`.

6. **`src/test/flows/flow5-refresh.test.tsx`** — Updated tests for new behavior: tab focus triggers full sync (dataset cycles), activity-gated interval, inactive user skips refresh, cooldown blocks tab-focus refresh.

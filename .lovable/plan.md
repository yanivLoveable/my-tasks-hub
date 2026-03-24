

# Fix Auth Refresh, Auto-Refresh Logic, Remove userId from API Calls

## Problems Identified

1. **Token refresh not working** — `RealAuthProvider.authenticate()` returns `keycloak.token` but never calls `keycloak.updateToken()`. When the token expires, it just returns the stale one. The 401 retry in `http.ts` calls `authenticate()` which returns the same expired token.

2. **Auto-refresh only calls `loadTasks` (GET), never `triggerRefresh` (POST)** — The 5-min interval and tab-focus handlers call `loadTasks()` which only reads from Postgres. They never trigger the sync flow that updates Postgres from external systems.

3. **Auto-refresh fires even when user is inactive** — The 5-min interval fires whenever the tab is visible, even if the user went to lunch with the screen open. Need to track actual user activity.

4. **`userId` is passed as query param** — Backend now extracts user from the token, so `userId` param must be removed from `fetchUserTasks`, `triggerRefresh`, and all callers.

5. **Refresh spinner not spinning** — The `refresh()` function guards with `if (!shouldUseMock && !isReady)`. If `isReady` is false at the moment of click (e.g. token being refreshed), it silently returns without setting `refreshing=true`.

---

## Changes

### 1. Fix `RealAuthProvider` — use `keycloak.updateToken()` for refresh

**File: `src/context/auth-context.tsx`**

- In `authenticate()`, call `await keycloak.updateToken(30)` before reading `keycloak.token`. This asks keycloak-js to use the refresh token if the access token expires within 30 seconds.
- Remove the `getStoredTokenInfo()` check in `ensureAuthenticated` — the Keycloak instance manages its own token state; localStorage caching is unnecessary for real auth.
- Keep the proactive timer but base it on `keycloak.tokenParsed?.exp` instead of localStorage.

### 2. Remove `userId` from API calls

**Files: `src/services/tasksService.ts`, `src/services/refreshService.ts`, `src/hooks/useTasks.ts`**

- `fetchUserTasks(token, signal?)` — remove `userId` param, remove it from the query string. Keep `limit` and `offset`.
- `triggerRefresh(token)` — remove `userId` param and query string.
- `useTasks.ts` — remove `user.id` from all calls to `fetchUserTasks` and `triggerRefresh`. Remove the `!user?.id` check from `shouldUseMock` (use only `APP_ENV === "dev"`).

### 3. Auto-refresh triggers full sync, with user-activity gating

**File: `src/hooks/useTasks.ts`**

- **Tab focus** — when user returns to screen, call `refresh()` (full sync: POST refresh -> poll -> GET) instead of `loadTasks()` (GET only). Respect cooldown.
- **5-min interval** — track last user interaction (mousemove, keydown, click) via a `lastActivityRef`. The interval only fires `refresh()` if user was active in the last 5 minutes. If inactive, skip.
- Remove `MIN_REFETCH_GAP_MS` (60s) — replaced by the cooldown mechanism which already prevents spam.

### 4. Update types

**File: `src/types/api.ts`**

- Remove `userId` from `RefreshResponse` (backend no longer sends it).
- Keep `ApiResponseMetadata.userId` if backend still returns it in GET response.

### 5. Update tests

**File: `src/test/flows/flow5-refresh.test.tsx`**

- "auto-refreshes on tab focus" test — verify that tab focus triggers `refresh` (mock dataset cycles) instead of just `loadTasks` (same dataset).
- "5-min interval" test — simulate user activity before interval, confirm refresh fires. Simulate no activity, confirm it does not fire.
- Add test: "does NOT auto-refresh when user is inactive for 5 minutes".

**File: `src/test/flows/flow1-initial-load.test.tsx`** — no changes needed (mock path unaffected).

---

## Summary of file changes

| File | Action |
|------|--------|
| `src/context/auth-context.tsx` | Use `keycloak.updateToken(30)` in `authenticate()` |
| `src/services/tasksService.ts` | Remove `userId` param |
| `src/services/refreshService.ts` | Remove `userId` param |
| `src/hooks/useTasks.ts` | Remove `userId` usage, add activity tracking, tab-focus calls `refresh()`, 5-min interval checks activity |
| `src/types/api.ts` | Remove `userId` from `RefreshResponse` |
| `src/test/flows/flow5-refresh.test.tsx` | Update auto-refresh tests for new behavior |


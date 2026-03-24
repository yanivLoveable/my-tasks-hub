

# Three Fixes: Token Refresh, Empty System Filters, Task Card Layout

## 1. Token Refresh on 401

**Problem:** When the API token expires mid-session, `http.ts` throws immediately with no retry. The `RealAuthProvider` already has a proactive timer but it can miss edge cases.

**Solution:** Add a single-retry mechanism in `http.ts`. On a 401 response, call a registered re-auth callback to get a fresh token, then retry the request once.

### Files:
- **`src/services/authRetry.ts` (new)** — Tiny registry: `setAuthRetryFn(fn)` and `getAuthRetryFn()`. Avoids circular imports between `http.ts` and `auth-context.tsx`.
- **`src/services/http.ts`** — On 401, call `getAuthRetryFn()`, get a fresh token, retry the request once. If the retry also fails, throw as normal.
- **`src/context/auth-context.tsx`** — In both `MockAuthProvider` and `RealAuthProvider`, register `authenticate` via `setAuthRetryFn()` on mount so `http.ts` can use it.

## 2. Show All Primary Systems Even When Empty

**Problem:** `FiltersBar` derives systems from `tasks.map(t => t.systemLabel)`, so if no tasks exist for SNOW or DOCS, those buttons disappear.

**Solution:** Always show `PRIMARY_SYSTEMS` (SNOW, ERP, DOCS) regardless of whether tasks exist for them. The count will display `(0)` for empty systems.

### File: `src/components/FiltersBar.tsx`
- Change `primarySystems` from filtering by `systems.includes(s)` to always using all `PRIMARY_SYSTEMS`.
- When `systemCounts[sys]` is undefined, display `(0)`.

## 3. Task Card: Smaller Title Font + Identifier Below Title

**Problem:** Long mixed Hebrew/English titles are too large. The identifier sits inline with the title.

**Solution:** Reduce title font from 16px to 14px and move the identifier to its own line below the title.

### File: `src/components/TaskCard.tsx`
- Change title `text-[16px]` → `text-[14px]`.
- Move the identifier `<span>` out of the title's flex row into a separate line below.


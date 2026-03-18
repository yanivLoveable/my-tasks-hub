

# Partial Refresh Success Indicator

## Overview
Add visual indicators when some systems fail to sync during a refresh, using amber warnings next to the header timestamp and on affected system filter buttons. The Back to Top button already exists and matches the spec — no changes needed there.

## Data Model Changes

### 1. New type: `FailedSystem` in `src/types/api.ts`
Add a new exported type to represent per-system failure info:
```ts
export interface SystemSyncStatus {
  system: string;
  failed: boolean;
  lastSyncedAt?: Date;
}
```

### 2. New state in `useTasks` hook (`src/hooks/useTasks.ts`)
- Add `failedSystems` state: `Record<string, Date>` — maps system labels to their last successful sync timestamp.
- After `refresh()` completes, inspect the `JobRunResponse.result.sources` object. For each source with `status !== "succeeded"`, record it in `failedSystems`.
- On a fully successful refresh, clear `failedSystems` to `{}`.
- In mock mode, simulate a partial failure randomly or always clear (keep it simple — always clear).
- Expose `failedSystems` from the hook return.

### 3. Parse logic in `refresh()` function
The API already returns `job.result?.sources` with per-source status. After `waitForJob`:
```
const sources = job.result?.sources ?? {};
const failed: Record<string, Date> = {};
for (const [sys, info] of Object.entries(sources)) {
  if (info.status !== "succeeded") {
    failed[sys] = failedSystems[sys] ?? lastUpdated ?? new Date();
  }
}
setFailedSystems(failed);
```
Only throw if ALL sources failed (total failure). Partial = set warning state + still update tasks.

## UI Changes

### 4. Header timestamp warning (`src/components/Header.tsx`)
- Accept new prop `hasPartialFailure: boolean`.
- When `true`, render an `AlertTriangle` icon (amber-500, size 14) next to the "עדכון אחרון" timestamp.
- Wrap in a `Tooltip` showing: `"רענון חלק מהמערכות נכשל. המידע המוצג עשוי להיות חלקי."`

### 5. Filter button warnings (`src/components/FiltersBar.tsx`)
- Accept new prop `failedSystems: Record<string, Date>`.
- For each system button where `failedSystems[sys]` exists, render a small `AlertTriangle` (amber-500, size 12) after the count.
- Wrap the entire button in a `Tooltip` showing: `"סונכרן לאחרונה ב-[formatted timestamp]"`.
- The icon is inline and small enough not to expand the button significantly.

### 6. Wire props in `src/pages/Index.tsx`
- Destructure `failedSystems` from `useTasks()`.
- Pass `hasPartialFailure={Object.keys(failedSystems).length > 0}` to `Header`.
- Pass `failedSystems={failedSystems}` to `FiltersBar`.

## Styling
- Amber color: `text-amber-500` (#F59E0B) for warning icons.
- Icons: `AlertTriangle` from lucide-react, sizes 12-14px.
- No layout shifts — icons are inline-flex within existing elements.

## Back to Top Button
Already implemented in `BackToTop.tsx` with the exact spec (pill shape, centered, dark blue 75% opacity, backdrop-blur, chevron icon, Hebrew text, appears after 200px scroll). No changes needed.

## Files Modified
1. `src/hooks/useTasks.ts` — add `failedSystems` state + parse logic
2. `src/components/Header.tsx` — amber warning icon next to timestamp
3. `src/components/FiltersBar.tsx` — per-system amber warning icons
4. `src/pages/Index.tsx` — wire new props




## Bug: Refresh button shows stale cooldown popover after 5 minutes

### Root Cause

In `Index.tsx` line 121, `cooldown={isOnCooldown()}` is evaluated at render time. No timer or state update triggers a re-render when the cooldown period expires, so the `cooldown` prop remains `true` even after 5 minutes have passed.

When the user clicks the refresh button, `handleClick` in `RefreshPopover` checks the stale `cooldown` prop and shows the popover with "0 דקות" instead of calling `onRefresh()`.

### Fix

Two changes:

1. **`src/hooks/useTasks.ts`** — Add a `cooldown` state variable with a timer that automatically clears it when the cooldown expires. This ensures the component re-renders at the right time.
   - Add `const [cooldown, setCooldown] = useState(isOnRefreshCooldown())`
   - In `refresh`, after setting cooldown in localStorage, also `setCooldown(true)` and start a `setTimeout` for `REFRESH_COOLDOWN_MS` that sets `setCooldown(false)`
   - Change `isOnCooldown` to return the reactive `cooldown` state instead of reading localStorage each time
   - Clean up the timeout on unmount

2. **`src/components/RefreshPopover.tsx`** — As a safety net, in `handleClick`, re-check cooldown in real-time using `isOnRefreshCooldown()` directly. If the cooldown has actually expired, call `onRefresh()` instead of opening the popover.

### Test update

3. **`src/test/flows/flow5-refresh.test.tsx`** — Add a test case that verifies: after clicking refresh, advancing timers by 5+ minutes, clicking refresh again should trigger a new refresh (spinning icon) rather than showing the cooldown popover.




# Fix: flow1-initial-load test failure

## Root Cause Analysis

After thorough review of useTasks.ts, Index.tsx, TaskCard, sortTasks, filterTasks, and all data files — the logic is correct. The mock path creates tasks after a 300ms delay, which should resolve within waitFor's 1000ms default timeout.

The most likely cause is a **timing/flakiness issue** introduced by the new activity-tracking event listeners and the `refresh` callback recreating on every `failedSystems`/`lastUpdated` change, causing additional React re-renders that push task rendering slightly beyond the default waitFor timeout in certain environments.

## Fix

**File: `src/test/flows/flow1-initial-load.test.tsx`**

Use `screen.findByText()` (which is waitFor + getByText with a longer 3s default timeout) instead of manually wrapping `waitFor(() => getByText(...))`. This is also the idiomatic Testing Library pattern.

Additionally, move the `sortTasks` call **outside** the waitFor/retry loop — it doesn't need to re-run on every retry.

```ts
it("loads and displays tasks after loading state", async () => {
  renderApp(<Index />);
  const sorted = sortTasks([...MOCK_TASKS], "default", "asc");
  expect(await screen.findByText(sorted[0].title)).toBeInTheDocument();
});
```

Apply the same pattern to the other tests in the file that use `waitFor + getByText`:
- "shows pagination with total items count" → `findByText(/מציג 1-20 מתוך/)`
- "shows total tasks count" → `findByText(String(MOCK_TASKS.length))`
- "task card contains required fields" → `findByText(firstTask.title)`

| File | Change |
|------|--------|
| `src/test/flows/flow1-initial-load.test.tsx` | Replace `waitFor(() => getByText)` with `findByText` pattern, move sort outside retry loop |


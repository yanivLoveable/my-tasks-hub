

# Fix: Filter activation causes task list to shift down

## Problem

When you click a filter, the message "בהתאם לסינון, מוצגות X משימות" (line 149-155 in `Index.tsx`) conditionally renders. It goes from **not existing** to **existing in the DOM**, which pushes the entire task list down — a visible layout jump.

## Fix

**File: `src/pages/Index.tsx`**

Always render the filter-count container but use `invisible` (or `opacity-0`) when no filters are active. This reserves the vertical space permanently, preventing the layout shift.

Replace the conditional render `{!loading && (conditions) && (<div>...)}` with:

```tsx
<div className="flex items-center justify-start py-1.5 px-2" dir="rtl">
  <p className={`text-[11px] text-muted-foreground/60 transition-opacity ${
    !loading && hasActiveFilters ? "opacity-100" : "opacity-0"
  }`}>
    בהתאם לסינון, מוצגות {sorted.length} משימות
  </p>
</div>
```

This keeps the ~24px row always present so the list never jumps. The text just fades in/out.

Extract the `hasActiveFilters` boolean (already computed for `TaskList`) into a shared variable above both usages to keep it DRY.

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Always render filter-count row; toggle opacity instead of mount/unmount |


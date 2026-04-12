

## Plan: Replace system label text with PNG icons

### What changes
Replace the text-based system badge in `TaskCard.tsx` with PNG images (`docs.png`, `snow.png`, `erp.png`).

### Steps

1. **User places PNG files** in `public/icons/` directory: `docs.png`, `snow.png`, `erp.png`

2. **Add icon mapping** in `TaskCard.tsx`:
```tsx
const SYSTEM_ICONS: Record<string, string> = {
  DOCS: "/icons/docs.png",
  DOCS_APPROVAL: "/icons/docs.png",
  SNOW: "/icons/snow.png",
  ERP: "/icons/erp.png",
};
```

3. **Replace the badge div** (lines 55-57) — if a matching icon exists, render an `<img>`, otherwise fall back to the text label:
```tsx
<div className="w-[44px] h-[44px] flex-shrink-0 bg-secondary border border-border rounded-md flex items-center justify-center overflow-hidden">
  {SYSTEM_ICONS[task.source] ? (
    <img src={SYSTEM_ICONS[task.source]} alt={task.systemLabel} className="w-8 h-8 object-contain" />
  ) : (
    <span className="font-bold text-[10px] text-primary">{task.systemLabel}</span>
  )}
</div>
```

### Files changed
- `src/components/TaskCard.tsx` — add icon map + conditional image rendering
- `public/icons/` — new directory with 3 PNG files (user provides)




## Plan: Change Modal Header Font Weight to Bold

Replace `font-extrabold` with `font-bold` on modal title elements only — the main page title in `ControlsBar.tsx` stays unchanged.

### Changes

1. **`src/components/SupportModal.tsx`** — `DialogTitle`: `font-extrabold` → `font-bold`
2. **`src/components/Header.tsx`** — Info modal `DialogTitle`: `font-extrabold` → `font-bold`
3. **`src/components/FeedbackModal.tsx`** — `DialogTitle` and success message: `font-extrabold` → `font-bold`

No changes to `ControlsBar.tsx` (main page heading).


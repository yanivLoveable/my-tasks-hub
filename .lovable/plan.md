

## Plan: Improve text contrast for color-blind accessibility

### Problem
Light gray text (`text-muted-foreground` = `hsl(220, 9%, 46%)` and its `/60`, `/70` opacity variants) is hard to read for color-blind users. The affected elements:
- **Header**: "עדכון אחרון | רענון הבא" — uses `text-muted-foreground/60`
- **ControlsBar**: "ממתינות לך... משימות לביצוע" — uses `text-muted-foreground`, and the sub-line uses `text-muted-foreground/70`
- **FiltersBar**: "נקה הכל" (inactive state) — uses `text-muted-foreground/40`

### Solution
Increase contrast by darkening `--muted-foreground` globally and removing low-opacity variants.

### Changes

**1. `src/index.css`** — Darken `--muted-foreground` from `220 9% 46%` to `220 9% 36%` (was already a medium gray, making it noticeably darker).

**2. `src/components/Header.tsx` (line 45)** — Change `text-muted-foreground/60` to `text-muted-foreground` (full opacity with the new darker color).

**3. `src/components/ControlsBar.tsx` (line 23)** — Change `text-muted-foreground/70` to `text-muted-foreground`.

**4. `src/components/FiltersBar.tsx` (line 402)** — Change `text-muted-foreground/40` to `text-muted-foreground/70` for the inactive "נקה הכל" button.

**5. `src/components/TaskCard.tsx`** — Change any `text-muted-foreground/60` and `text-muted-foreground/30` to `text-muted-foreground` and `text-muted-foreground/60` respectively.

**6. `src/pages/Index.tsx` (line 156)** — Change `text-muted-foreground/60` to `text-muted-foreground`.

This ensures all secondary text meets WCAG AA contrast ratio (4.5:1) while preserving visual hierarchy.


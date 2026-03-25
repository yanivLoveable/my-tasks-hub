

# Replace Logo + Add Task Card Animations

## 1. Replace "YANIV" text with an SVG logo

Since image upload is failing, I'll create an inline SVG logo directly in the Header component. It will be a clean, modern logotype spelling "YANIV" with a small icon element — similar dimensions to the current text (~80px wide, ~20px tall).

**File: `src/components/Header.tsx`**
- Replace the `<span>YANIV</span>` with an inline SVG logo mark — a small geometric icon (a stylized "Y" monogram inside a rounded square) followed by the text "YANIV" rendered as SVG text with the primary color
- Size: ~90px wide × 24px tall to match current footprint

## 2. Add enter/exit animations to task cards

Use CSS `@keyframes` with staggered delays for smooth fade+slide-in when tasks appear, and leverage `layout` transitions.

**File: `tailwind.config.ts`**
- Add `task-enter` keyframe: fade-in + slide from right (RTL-friendly) over 250ms
- Add corresponding animation class

**File: `src/components/TaskCard.tsx`**
- Add `animate-task-enter` class to the card wrapper

**File: `src/components/TaskList.tsx`**
- Add staggered animation delay via inline style `animationDelay: ${index * 50}ms` on each TaskCard wrapper
- Add `animate-task-enter` with `opacity-0` initial state and `animation-fill-mode: forwards`

This gives a subtle cascading entrance effect when the list loads or filters change, without needing a heavy animation library.

| File | Change |
|------|--------|
| `src/components/Header.tsx` | Replace text logo with inline SVG logo |
| `tailwind.config.ts` | Add `task-enter` keyframe + animation |
| `src/components/TaskList.tsx` | Add staggered animation delays to cards |
| `src/components/TaskCard.tsx` | Add enter animation class |




# Remove Animations & Replace SVG Logo with PNG

## 1. Remove task enter/exit animations

**`src/components/TaskList.tsx`**
- Remove all diff-based animation logic (useRef for prevIds, newTaskIds state, exitingTasks state, related useEffects)
- Render tasks simply without animation classes

**`tailwind.config.ts`**
- Remove `task-enter` and `task-exit` keyframes and animation entries

**`src/hooks/useTasks.ts`**
- Remove the `hasLoadedOnce` ref and restore normal loading behavior (show skeletons on every load)

## 2. Replace SVG logo with PNG

**`src/components/Header.tsx`**
- Replace the inline SVG with an `<img>` tag pointing to a PNG file
- Size it to match current dimensions (~90px wide)

You'll need to upload your PNG logo file — just attach it in the chat after this plan is applied and I'll wire it up.

| File | Change |
|------|--------|
| `src/components/TaskList.tsx` | Remove all animation diffing logic, render cards plainly |
| `tailwind.config.ts` | Remove task-enter/task-exit keyframes and animations |
| `src/hooks/useTasks.ts` | Restore simple loading state |
| `src/components/Header.tsx` | Replace SVG with PNG `<img>` tag |


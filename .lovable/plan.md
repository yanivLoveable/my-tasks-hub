

## Fix: Selected overflow items should render as chip buttons, not small tags

### Problem
When selecting a system from "עוד" (moreSystems) or a topic from "עוד" (moreTopics), they render as small pill tags with an X. They should instead render as regular active chip buttons (using `chipStyle(true)`) — matching the look of the primary system/topic buttons. Systems should also include the task count.

### Changes — `src/components/FiltersBar.tsx`

**1. Replace moreSelectedSystems tags (lines 229-242):**
Change from `<span>` pill tags to `<button>` elements using `chipStyle(true)`, showing the system label + count + X icon — matching primary system buttons.

**2. Replace moreSelectedTopics tags (lines 300-313):**
Same change — use `chipStyle(true)` buttons with topic name + X icon instead of small pill tags.


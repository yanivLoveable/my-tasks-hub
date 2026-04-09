

## Plan: Add "עוד" dropdown for topic filters when more than 5

### What changes
In `src/components/FiltersBar.tsx`, the topics row (line 274-294) currently renders all topic buttons inline. When there are more than 5 categories, this can overflow to a second line.

### How
1. **Split topics into visible and overflow**: Show the first 5 topics as inline buttons. If `topics.length > 5`, collect the rest into an "עוד" dropdown — same pattern already used for system filters (lines 243-267).

2. **Add "עוד" dropdown for overflow topics**: Render a `DropdownMenu` with `DropdownMenuItem` for each overflow topic, showing active state with `bg-primary/10 font-semibold` (matching the system "עוד" pattern).

3. **Show selected overflow topics as tags**: Any selected topic from the overflow list appears as a removable tag (pill with X button) next to the visible topics — same pattern as `moreSelectedSystems` tags (lines 229-242).

### Single file change: `src/components/FiltersBar.tsx`
- Lines 274-294: Replace the topics rendering block with:
  - `const visibleTopics = topics.slice(0, 5)`
  - `const moreTopics = topics.slice(5)`
  - `const moreSelectedTopics = selectedTopics.filter(t => moreTopics.includes(t))`
  - Render `visibleTopics` as buttons, then selected overflow tags, then "עוד" dropdown if `moreTopics.length > 0`


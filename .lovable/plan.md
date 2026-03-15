

## Plan: Move "Back to Top" Button to Bottom-Right

**Change**: Update `src/components/BackToTop.tsx` positioning from centered (`left-1/2 -translate-x-1/2`) to bottom-right (`right-6`), keeping `bottom-8` and all other styles unchanged.

**File**: `src/components/BackToTop.tsx` (line 30)
- Remove: `left-1/2 -translate-x-1/2`
- Add: `right-6`

Single-line change, no other files affected.


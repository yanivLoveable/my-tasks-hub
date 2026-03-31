

## Plan: All Pending Fixes

### 1. Use system fonts (no external requests, no npm package)
- **`index.html`**: Remove the `<link href="https://fonts.googleapis.com/...">` tag
- **`tailwind.config.ts`**: Change `fontFamily.sans` to a system font stack that includes good Hebrew support:
  ```
  ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif']
  ```
  These are available on all major browsers/OS and support Hebrew natively.
- **`src/index.css`**: Update the `body` font-family to match

### 2. Logo size 195×40
- **`src/components/Header.tsx` line 38**: Replace `className="h-6"` with `width={195} height={40}` and appropriate classes

### 3. Header buttons 32→36
- **`src/components/Header.tsx` lines 67, 90**: Change `w-8 h-8` to `w-9 h-9`

### 4. Timestamp line: unified font size & move higher
- **`src/components/Header.tsx` line 37**: Reduce `py-1.5` to `py-1` on the header row to move the line higher

### 5. Sticky footer
- **`src/pages/Index.tsx`**: Make root div `flex flex-col min-h-screen`, give content area `flex-1`, so footer always stays at the bottom

### 6. Feedback modal → internal API
- **`src/components/FeedbackModal.tsx`**: Replace `mailto` with:
  ```ts
  await httpPost("/api/work-items/feedback", token, { message: text });
  ```
  Add try/catch, show toast on error. Auto-close after 2 seconds on success.

### 7. Show (0) for systems with no tasks
- **`src/components/FiltersBar.tsx` line 208**: Change `systemCounts[sys] != null` to always show, using `systemCounts[sys] ?? 0`

### Files changed
`index.html`, `tailwind.config.ts`, `src/index.css`, `src/components/Header.tsx`, `src/pages/Index.tsx`, `src/components/FeedbackModal.tsx`, `src/components/FiltersBar.tsx`


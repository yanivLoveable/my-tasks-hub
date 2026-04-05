

## Fix: Feedback modal state reset and accessibility warnings

### Problems
1. After successful submission, the auto-close (`setTimeout(() => onOpenChange(false), 2000)` on line 35) calls `onOpenChange` directly instead of `handleClose`, so `submitted` and `text` are never reset. Reopening shows the success message.
2. When `submitted` is true, `DialogTitle` and `DialogDescription` are conditionally hidden, causing accessibility warnings.

### Changes — `src/components/FeedbackModal.tsx`

1. **Reset state when modal opens**: Add a `useEffect` that resets `text` and `submitted` whenever `open` becomes `true`. This guarantees a clean form every time the modal opens, regardless of how it was closed.

2. **Always render DialogTitle and DialogDescription**: Move them outside the conditional block so they're always present for accessibility. Use `className="sr-only"` on both when in the `submitted` state so they're invisible but still in the DOM for screen readers.

   Specifically: always render `<DialogTitle>` and `<DialogDescription>` with `aria-describedby` handled automatically. When `submitted` is true, visually hide them with `sr-only`.


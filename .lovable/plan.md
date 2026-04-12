

## Fix: Feedback sent twice (empty token causes 401 + retry)

### Root cause
`handleSubmit` reads `(user as any)?.token` but the `User` type (`{ id, username, name, email }`) has no `token` field. It's always `""`. The request goes out with an empty Bearer token, gets a 401, then `fetchWithRetry` in `http.ts` calls `authenticate()` to get a real token and retries — resulting in two network requests.

### Fix — `src/components/FeedbackModal.tsx`

Change `handleSubmit` to call `authenticate()` for a fresh token instead of reading a non-existent property:

```tsx
// Before
const { user } = useAuth();
// ...
const token = (user as any)?.token || "";

// After
const { authenticate } = useAuth();
// ...
const token = await authenticate();
```

Single line change in the destructuring (line 24) and one line in `handleSubmit` (line 38).


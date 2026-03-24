

# Extended Code Cleanup: Remove Dead Link Rewriting, Consolidate Config, Clean Auth

Building on the previous cleanup plan, adding these findings:

## Additional Dead Code Found

### 6. Delete `src/config/links.ts` and its test
- `LINK_HOSTS` and `rewriteTaskUrl` are **not used** — the call in `mapTasks.ts` is commented out (lines 19-21). Your backend already returns correct URLs per environment.
- Delete `src/config/links.ts`
- Delete `src/test/flows/flow7-links.test.tsx`
- Remove the re-export from `src/config/index.ts`
- Remove the dead import and commented-out code from `src/utils/mapTasks.ts`

### 7. Use `.env` config vars consistently
You asked "why not use the `.env`?" — good point. Currently `auth-context.tsx` reads `import.meta.env.VITE_KEYCLOAK_*` directly instead of using the centralized `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID` from `src/config/env.ts`. The fix (from step 4 of previous plan) is to import from `@/config` — single source of truth, cleaner code.

### 8. Keep `devAuth.ts` but clean it
You confirmed you use it here (Lovable preview) but not in your secured network. Keep the file, just remove the large commented-out "Step 2" block (lines 41-56).

---

## Full Combined Plan (previous + new)

| # | Action | File(s) |
|---|--------|---------|
| 1 | Delete `authClient.ts` (dead file) | `src/services/authClient.ts` |
| 2 | Gut `authService.ts` — keep only `storeAccessToken` | `src/services/authService.ts` |
| 3 | Extract `decodeJwtPayload` + `userFromPayload` into `src/utils/jwt.ts`, import in `auth-context.tsx` | New: `src/utils/jwt.ts`, edit: `src/context/auth-context.tsx` |
| 4 | Use config exports (`KEYCLOAK_URL` etc.) in `AuthProvider` instead of `import.meta.env` | `src/context/auth-context.tsx` |
| 5 | Delete `links.ts` + test, remove re-export and dead import | Delete: `src/config/links.ts`, `src/test/flows/flow7-links.test.tsx`. Edit: `src/config/index.ts`, `src/utils/mapTasks.ts` |
| 6 | Clean commented-out code in `devAuth.ts` | `src/services/devAuth.ts` |

No behavior changes. All remaining tests should pass.


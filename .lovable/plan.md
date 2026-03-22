

# Dev-Only Auth Helper File

## What It Does

A single utility file used **only in dev** that automates what you did manually in Swagger:

1. Call `POST ${API_BASE_URL}/api/auth/token` with `client_id` + `client_secret` → get a Keycloak token
2. Call `POST ${API_BASE_URL}/api/auth` with that Keycloak token → get an API access token
3. Store the API access token via `authService.storeAccessToken()`

This lets you bypass the browser-based Keycloak SSO login during development.

## Security Note

`VITE_CLIENT_ID` and `VITE_CLIENT_SECRET` are already defined in `src/config/env.ts`. Since these are `VITE_`-prefixed, they'll be bundled into the frontend — this is acceptable **only for dev**. The file will guard against running in non-dev environments.

## Changes

### 1. Create `src/services/devAuth.ts`

- Export `async function devAuthenticate(): Promise<string>`
- Throws if `APP_ENV !== "dev"` (safety guard)
- Step 1: `POST ${API_BASE_URL}/api/auth/token` with body `{ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }` → extracts the Keycloak token
- Step 2: passes that token to `exchangeKeycloakToken()` from `authService.ts` (which calls `/api/auth`) → gets API access token
- Stores via `storeAccessToken()` and returns it
- Includes error handling with descriptive messages

### 2. Update `src/context/auth-context.tsx` — MockAuthProvider

- In `MockAuthProvider`, import `devAuthenticate` and wire it into the `authenticate` function so that when `APP_ENV === "dev"`, calling `authenticate()` uses this client-credentials flow instead of throwing
- This way the existing `useTasks` hook works seamlessly in dev without Keycloak SSO

### 3. Update `.env`

- Add comments for `VITE_CLIENT_ID` and `VITE_CLIENT_SECRET` showing they're used for dev auth

## Files

1. `src/services/devAuth.ts` (new)
2. `src/context/auth-context.tsx` (minor update to MockAuthProvider)
3. `.env` (comment update)


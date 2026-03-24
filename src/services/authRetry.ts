/**
 * Tiny registry so http.ts can trigger re-auth on 401
 * without circular imports from auth-context.
 */
type AuthRetryFn = () => Promise<string>;

let _retryFn: AuthRetryFn | null = null;

export function setAuthRetryFn(fn: AuthRetryFn) {
  _retryFn = fn;
}

export function getAuthRetryFn(): AuthRetryFn | null {
  return _retryFn;
}

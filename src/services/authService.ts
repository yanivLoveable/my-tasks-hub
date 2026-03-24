const ACCESS_TOKEN_KEY = "notifCenter.apiAccessToken";

export function storeAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

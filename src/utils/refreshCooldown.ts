export const REFRESH_COOLDOWN_KEY = "notifCenter.refreshCooldownUntil";
export const REFRESH_COOLDOWN_MS = 5 * 60 * 1000;

export function getRefreshCooldownUntilMs(): number {
  const stored = localStorage.getItem(REFRESH_COOLDOWN_KEY);
  return stored ? Number.parseInt(stored, 10) || 0 : 0;
}

export function setRefreshCooldownUntilMs(untilMs: number): void {
  localStorage.setItem(REFRESH_COOLDOWN_KEY, String(untilMs));
}

export function isOnRefreshCooldown(nowMs: number = Date.now()): boolean {
  return nowMs < getRefreshCooldownUntilMs();
}

export function getRefreshCooldownRemainingMinutes(nowMs: number = Date.now()): number {
  const remainingMs = getRefreshCooldownUntilMs() - nowMs;
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / 60000);
}

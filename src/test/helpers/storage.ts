import { DEFAULT_UI_STATE, type UIState } from "@/types/task";

export function preloadUIState(partial: Partial<UIState> = {}) {
  const state = { ...DEFAULT_UI_STATE, ...partial };
  localStorage.setItem("notifCenter.uiState", JSON.stringify(state));
}

export function preloadCooldown(untilMs: number) {
  localStorage.setItem("notifCenter.refreshCooldownUntil", String(untilMs));
}

export function clearAllStorage() {
  localStorage.clear();
}

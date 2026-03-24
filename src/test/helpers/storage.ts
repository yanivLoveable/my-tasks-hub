import { DEFAULT_UI_STATE, type UIState } from "@/types/task";

export function preloadUIState(partial: Partial<UIState> = {}) {
  const state = { ...DEFAULT_UI_STATE, ...partial };
  localStorage.setItem("notifCenter.uiState", JSON.stringify(state));
}

export function clearAllStorage() {
  localStorage.clear();
}

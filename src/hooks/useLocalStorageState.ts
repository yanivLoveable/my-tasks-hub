import { useState, useCallback } from "react";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  // Handle common bad values
  if (raw === "undefined" || raw === "null") return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    return safeParse<T>(localStorage.getItem(key), defaultValue);
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [key]
  );

  return [state, setValue];
}

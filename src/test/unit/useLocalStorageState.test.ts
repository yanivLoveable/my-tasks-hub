import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

describe("useLocalStorageState", () => {
  beforeEach(() => localStorage.clear());

  it("returns default value when nothing in storage", () => {
    const { result } = renderHook(() => useLocalStorageState("test-key", 42));
    expect(result.current[0]).toBe(42);
  });

  it("reads existing value from storage", () => {
    localStorage.setItem("test-key", JSON.stringify({ a: 1 }));
    const { result } = renderHook(() => useLocalStorageState("test-key", { a: 0 }));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it("updates storage when setValue is called", () => {
    const { result } = renderHook(() => useLocalStorageState("test-key", "hello"));
    act(() => result.current[1]("world"));
    expect(result.current[0]).toBe("world");
    expect(localStorage.getItem("test-key")).toBe('"world"');
  });

  it("supports functional updates", () => {
    const { result } = renderHook(() => useLocalStorageState("test-key", 10));
    act(() => result.current[1]((prev) => prev + 5));
    expect(result.current[0]).toBe(15);
  });

  it("handles 'undefined' string gracefully", () => {
    localStorage.setItem("test-key", "undefined");
    const { result } = renderHook(() => useLocalStorageState("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("handles invalid JSON gracefully", () => {
    localStorage.setItem("test-key", "{bad json{{{");
    const { result } = renderHook(() => useLocalStorageState("test-key", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });

  it("handles 'null' string gracefully", () => {
    localStorage.setItem("test-key", "null");
    const { result } = renderHook(() => useLocalStorageState("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });
});

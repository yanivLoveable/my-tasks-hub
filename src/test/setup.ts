import "@testing-library/jest-dom";
import { vi } from "vitest";

// Radix Tooltip triggers timer-based internal state updates.
// We don't test tooltip behavior here, so mock it to reduce act(...) warnings.
vi.mock("@/components/ui/tooltip", async () => {
  const React = await import("react");
  const Fragment = React.Fragment;
  return {
    TooltipProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(Fragment, null, children),
    Tooltip: ({ children }: { children: React.ReactNode }) =>
      React.createElement(Fragment, null, children),
    TooltipTrigger: ({ children }: { children: React.ReactNode }) =>
      React.createElement(Fragment, null, children),
    TooltipContent: () => null,
  };
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock window.open
Object.defineProperty(window, "open", {
  writable: true,
  value: vi.fn(),
});

// Mock scrollTo
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

// Ensure localStorage has clear() in the test environment
if (!("localStorage" in window) || typeof window.localStorage?.clear !== "function") {
  let store: Record<string, string> = {};

  const storageMock: Storage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };

  Object.defineProperty(window, "localStorage", {
    value: storageMock,
    writable: true,
  });
}
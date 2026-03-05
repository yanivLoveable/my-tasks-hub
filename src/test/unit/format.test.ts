import { describe, it, expect } from "vitest";
import { formatDateTimeHebrew } from "@/utils/format";

describe("formatDateTimeHebrew", () => {
  it("formats as DD/MM/YYYY HH:MM", () => {
    const d = new Date(2026, 2, 5, 14, 30); // March 5, 2026 14:30
    expect(formatDateTimeHebrew(d)).toBe("05/03/2026 14:30");
  });

  it("pads single digits", () => {
    const d = new Date(2026, 0, 1, 9, 5); // Jan 1, 2026 09:05
    expect(formatDateTimeHebrew(d)).toBe("01/01/2026 09:05");
  });
});

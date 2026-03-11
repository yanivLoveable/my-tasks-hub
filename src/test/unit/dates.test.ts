import { describe, it, expect } from "vitest";
import { parseDate, parseDateNullable, formatDateHebrew, getOverdueDays, formatTime } from "@/utils/dates";

describe("parseDate", () => {
  it("parses compact format 20260303T075546.445", () => {
    const d = parseDate("20260303T075546.445");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(2); // March = 2
    expect(d!.getDate()).toBe(3);
  });

  it("parses space-separated format", () => {
    const d = parseDate("2026-03-03 09:55:46");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getFullYear()).toBe(2026);
  });

  it("parses ISO format", () => {
    const d = parseDate("2026-01-15T10:30:00.000Z");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getFullYear()).toBe(2026);
  });

  it("returns undefined for empty/null/undefined", () => {
    expect(parseDate("")).toBeUndefined();
    expect(parseDate(null)).toBeUndefined();
    expect(parseDate(undefined)).toBeUndefined();
    expect(parseDate("   ")).toBeUndefined();
  });

  it("returns undefined for invalid date string", () => {
    expect(parseDate("not-a-date")).toBeUndefined();
  });
});

describe("parseDateNullable", () => {
  it("returns null for empty/null/undefined", () => {
    expect(parseDateNullable("")).toBeNull();
    expect(parseDateNullable(null)).toBeNull();
    expect(parseDateNullable(undefined)).toBeNull();
  });

  it("returns Date for valid input", () => {
    const d = parseDateNullable("2026-01-01");
    expect(d).toBeInstanceOf(Date);
  });

  it("returns null for invalid string", () => {
    expect(parseDateNullable("garbage")).toBeNull();
  });
});

describe("formatDateHebrew", () => {
  it("formats date as DD/MM/YY", () => {
    const d = new Date(2026, 2, 5); // March 5, 2026
    expect(formatDateHebrew(d)).toBe("05/03/26");
  });

  it("returns empty string for null/undefined", () => {
    expect(formatDateHebrew(null)).toBe("");
    expect(formatDateHebrew(undefined)).toBe("");
  });
});

describe("getOverdueDays", () => {
  it("returns 0 for null/undefined", () => {
    expect(getOverdueDays(null)).toBe(0);
    expect(getOverdueDays(undefined)).toBe(0);
  });

  it("returns 0 for future date", () => {
    const future = new Date(Date.now() + 86400000 * 10);
    expect(getOverdueDays(future)).toBe(0);
  });

  it("returns positive days for past date", () => {
    const past = new Date(Date.now() - 86400000 * 5);
    expect(getOverdueDays(past)).toBeGreaterThanOrEqual(5);
  });
});

describe("formatTime", () => {
  it("formats HH:MM", () => {
    const d = new Date(2026, 0, 1, 9, 5);
    expect(formatTime(d)).toBe("09:05");
  });
});

/**
 * Robust date parser for multiple formats:
 * - "20260303T075546.445"
 * - "2026-03-03 09:55:46"
 * - ISO 8601
 */
export function parseDate(value: string | undefined | null): Date | undefined {
  if (!value || value.trim() === "") return undefined;

  const s = value.trim();

  // Compact format: "20260303T075546.445"
  const compact = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.(\d+))?$/.exec(s);
  if (compact) {
    const [, y, mo, d, h, mi, sec] = compact;
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:${sec}`);
  }

  // Space-separated: "2026-03-03 09:55:46"
  const spaceSep = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s);
  if (spaceSep) {
    return new Date(s.replace(" ", "T"));
  }

  // Fallback ISO
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}

export function parseDateNullable(value: string | undefined | null): Date | null {
  if (value === "" || value === null || value === undefined) return null;
  return parseDate(value) ?? null;
}

export function formatDateHebrew(d: Date | null | undefined): string {
  if (!d) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

const MAX_OVERDUE_DAYS = 82;

export function getOverdueDays(dueDate: Date | null | undefined): number {
  if (!dueDate) return 0;
  const now = new Date();
  const diff = now.getTime() - dueDate.getTime();
  if (diff <= 0) return 0;
  return Math.min(Math.ceil(diff / (1000 * 60 * 60 * 24)), MAX_OVERDUE_DAYS);
}

export function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

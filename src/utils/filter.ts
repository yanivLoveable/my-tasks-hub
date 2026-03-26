import type { Task, UIState } from "@/types/task";
import { formatDateHebrew } from "./dates";

/* QWERTY → Hebrew keyboard mapping (standard Israeli layout) */
const EN_TO_HE: Record<string, string> = {
  q: "/", w: "'", e: "ק", r: "ר", t: "א", y: "ט", u: "ו", i: "ן", o: "ם", p: "פ",
  a: "ש", s: "ד", d: "ג", f: "כ", g: "ע", h: "י", j: "ח", k: "ל", l: "ך",
  z: "ז", x: "ס", c: "ב", v: "ה", b: "נ", n: "מ", m: "צ",
  ",": "ת", ".": "ץ", ";": "ף",
};

function toHebrew(str: string): string {
  return [...str].map((c) => EN_TO_HE[c.toLowerCase()] ?? c).join("");
}

export function filterTasks(tasks: Task[], state: UIState): Task[] {
  let result = tasks;

  // System filter (multi-select)
  if (state.selectedSystems.length > 0) {
    const set = new Set(state.selectedSystems);
    result = result.filter((t) => set.has(t.systemLabel));
  }

  // Topic filter (multi-select)
  if (state.selectedTopics.length > 0) {
    const set = new Set(state.selectedTopics);
    result = result.filter((t) => t.category && set.has(t.category));
  }

  // Flags
  if (state.flags.overdueOnly) {
    result = result.filter((t) => t.overdueDays && t.overdueDays > 0);
  }

  if (state.flags.groupOnly) {
    result = result.filter((t) => !!t.groupName);
  }

  if (state.flags.delegationOnly) {
    result = result.filter((t) => !!t.delegatedFrom);
  }

  if (state.flags.personalOnly) {
    result = result.filter((t) => !t.groupName && !t.delegatedFrom);
  }

  // Search – match both original query and Hebrew-mapped fallback
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.trim().toLowerCase();
    const hebrewQ = toHebrew(q);
    result = result.filter((t) => {
      const fields = [
        t.title,
        t.identifier,
        t.startDate ? formatDateHebrew(t.startDate) : "",
        t.dueDate ? formatDateHebrew(t.dueDate) : "",
      ];
      return fields.some((f) => f.toLowerCase().includes(q) || f.includes(hebrewQ));
    });
  }

  return result;
}

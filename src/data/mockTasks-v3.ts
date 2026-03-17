import type { Task } from "@/types/task";

/**
 * Mock dataset v3 — simulates yet another snapshot:
 * - More urgent tasks, different system mix
 * - Some tasks from v2 resolved, new ones added
 * ~28 tasks
 */
export const MOCK_TASKS_V3: Task[] = [
  // === ERP (4 tasks) ===
  {
    id: "ERP-882199", source: "ERP", systemLabel: "ERP",
    title: "אישור הזמנת מחשבים ניידים", identifier: "ERP-882199", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-02-10"), dueDate: new Date("2026-02-20"),
    category: "רכש וכספים", assignedToRole: "רכש וכספים",
    updatedAt: new Date("2026-03-15"), overdueDays: 23,
  },
  {
    id: "ERP-300001", source: "ERP", systemLabel: "ERP",
    title: "אישור תשלום לספק בינלאומי", identifier: "ERP-300001", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-03-08"), dueDate: new Date("2026-03-20"),
    category: "רכש וכספים", assignedToRole: "רכש וכספים",
    updatedAt: new Date("2026-03-15"),
  },
  {
    id: "ERP-400001", source: "ERP", systemLabel: "ERP",
    title: "סקירת תקציב פרויקט תשתיות", identifier: "ERP-400001", url: "#",
    status: "open", priority: "medium",
    startDate: new Date("2026-03-12"), dueDate: new Date("2026-04-15"),
    category: "רכש וכספים", assignedToRole: "צוות מאשרי שכר", groupName: "צוות מאשרי שכר",
    updatedAt: new Date("2026-03-12"),
  },
  {
    id: "ERP-400002", source: "ERP", systemLabel: "ERP",
    title: "אישור חשבונית ייעוץ חיצוני", identifier: "ERP-400002", url: "#",
    status: "open", priority: "low",
    startDate: new Date("2026-03-14"), dueDate: new Date("2026-05-01"),
    category: "רכש וכספים", assignedToRole: "רכש וכספים",
    updatedAt: new Date("2026-03-14"),
  },
  // === DOCS (3 tasks) ===
  {
    id: "DOCS-889900", source: "DOCS_APPROVAL", systemLabel: "DOCS",
    title: "סקירת חוזה עם ספק חיצוני", identifier: "DOCS-889900", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2025-10-20"), dueDate: new Date("2025-11-30"),
    category: "משפטי", assignedToRole: "משפטי",
    updatedAt: new Date("2026-03-15"), overdueDays: 105,
  },
  {
    id: "DOCS-400003", source: "DOCS_APPROVAL", systemLabel: "DOCS",
    title: "אישור נוהל בטיחות מעודכן", identifier: "DOCS-400003", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-03-10"), dueDate: new Date("2026-03-17"),
    category: "תפעול", assignedToRole: "תפעול",
    updatedAt: new Date("2026-03-10"),
  },
  {
    id: "DOCS-400004", source: "DOCS_APPROVAL", systemLabel: "DOCS",
    title: "סקירת הסכם שירות ענן", identifier: "DOCS-400004", url: "#",
    status: "open", priority: "medium",
    startDate: new Date("2026-03-13"), dueDate: new Date("2026-04-10"),
    category: "משפטי", assignedToRole: "משפטי", delegatedFrom: "מיכל דוד",
    updatedAt: new Date("2026-03-13"),
  },
  // === JIRA (4 tasks) ===
  {
    id: "JIRA-200002", source: "JIRA", systemLabel: "JIRA",
    title: "תיקון באג קריטי במערכת הזמנות", identifier: "JIRA-200002", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-02-01"), dueDate: new Date("2026-02-15"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-15"), overdueDays: 28,
  },
  {
    id: "JIRA-300002", source: "JIRA", systemLabel: "JIRA",
    title: "בדיקת ביצועים למודול חיפוש", identifier: "JIRA-300002", url: "#",
    status: "open", priority: "high", // upgraded
    startDate: new Date("2026-03-05"), dueDate: new Date("2026-04-10"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-15"),
  },
  {
    id: "JIRA-400005", source: "JIRA", systemLabel: "JIRA",
    title: "פיתוח API לאינטגרציה חדשה", identifier: "JIRA-400005", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-03-14"), dueDate: new Date("2026-03-28"),
    category: "IT", assignedToRole: "IT", groupName: "צוות דיגיטציה",
    updatedAt: new Date("2026-03-14"),
  },
  {
    id: "JIRA-400006", source: "JIRA", systemLabel: "JIRA",
    title: "עדכון תיעוד טכני למערכת", identifier: "JIRA-400006", url: "#",
    status: "open", priority: "low",
    startDate: new Date("2026-03-11"), dueDate: new Date("2026-05-01"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-11"),
  },
  // === SNOW (4 tasks) ===
  {
    id: "SNOW-667788", source: "SNOW", systemLabel: "SNOW",
    title: "אישור רכישת רישיונות תוכנה", identifier: "SNOW-667788", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-01-10"), dueDate: new Date("2026-02-05"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-15"), overdueDays: 38,
  },
  {
    id: "SNOW-300003", source: "SNOW", systemLabel: "SNOW",
    title: "התקנת תחנת עבודה לעובד חדש", identifier: "SNOW-300003", url: "#",
    status: "open", priority: "high", // upgraded
    startDate: new Date("2026-03-10"), dueDate: new Date("2026-03-18"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-15"),
  },
  {
    id: "SNOW-400007", source: "SNOW", systemLabel: "SNOW",
    title: "תקלת הדפסה בקומה 3", identifier: "SNOW-400007", url: "#",
    status: "open", priority: "low",
    startDate: new Date("2026-03-15"), dueDate: new Date("2026-03-25"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-15"),
  },
  {
    id: "SNOW-200014", source: "SNOW", systemLabel: "SNOW",
    title: "הקמת סביבת בדיקות חדשה", identifier: "SNOW-200014", url: "#",
    status: "open", priority: "high", // upgraded
    startDate: new Date("2026-02-12"), dueDate: new Date("2026-03-20"),
    category: "IT", assignedToRole: "צוות אבטחה", groupName: "צוות אבטחה",
    updatedAt: new Date("2026-03-15"),
  },
  // === CRM (3 tasks) ===
  {
    id: "CRM-556677", source: "CRM", systemLabel: "CRM",
    title: "אישור הצעת מחיר ללקוח אסטרטגי", identifier: "CRM-556677", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-02-25"), dueDate: new Date("2026-04-15"),
    category: "שיווק", assignedToRole: "שיווק",
    updatedAt: new Date("2026-03-15"),
  },
  {
    id: "CRM-400008", source: "CRM", systemLabel: "CRM",
    title: "הגדרת קמפיין לידים חדש", identifier: "CRM-400008", url: "#",
    status: "open", priority: "medium",
    startDate: new Date("2026-03-12"), dueDate: new Date("2026-04-20"),
    category: "שיווק", assignedToRole: "שיווק",
    updatedAt: new Date("2026-03-12"),
  },
  {
    id: "CRM-400009", source: "CRM", systemLabel: "CRM",
    title: "דוח שביעות רצון לקוחות שנתי", identifier: "CRM-400009", url: "#",
    status: "open", priority: "medium",
    startDate: new Date("2026-03-01"), dueDate: new Date("2026-03-30"),
    category: "שיווק", assignedToRole: "שיווק", delegatedFrom: "רונית שמעון",
    updatedAt: new Date("2026-03-01"),
  },
  // === SAP (3 tasks) ===
  {
    id: "SAP-200005", source: "SAP", systemLabel: "SAP",
    title: "סגירת הזמנת רכש ישנה", identifier: "SAP-200005", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2025-11-15"), dueDate: new Date("2026-01-05"),
    category: "רכש וכספים", assignedToRole: "רכש וכספים",
    updatedAt: new Date("2026-03-15"), overdueDays: 69,
  },
  {
    id: "SAP-200021", source: "SAP", systemLabel: "SAP",
    title: "דוח רווח והפסד שנתי", identifier: "SAP-200021", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2025-12-01"), dueDate: new Date("2026-01-31"),
    category: "רכש וכספים", assignedToRole: "צוות מאשרי שכר",
    updatedAt: new Date("2026-03-15"), overdueDays: 43,
  },
  {
    id: "SAP-400010", source: "SAP", systemLabel: "SAP",
    title: "אימות נתוני מלאי סוף רבעון", identifier: "SAP-400010", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-03-14"), dueDate: new Date("2026-03-20"),
    category: "רכש וכספים", assignedToRole: "צוות מאשרי שכר", groupName: "צוות מאשרי שכר",
    updatedAt: new Date("2026-03-14"),
  },
  // === TEAMS (2 tasks) ===
  {
    id: "TEAMS-200007", source: "TEAMS", systemLabel: "TEAMS",
    title: "הכנת מצגת לישיבת הנהלה", identifier: "TEAMS-200007", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-02-25"), dueDate: new Date("2026-03-10"),
    category: "תפעול", assignedToRole: "תפעול",
    updatedAt: new Date("2026-03-15"), overdueDays: 5,
  },
  {
    id: "TEAMS-400011", source: "TEAMS", systemLabel: "TEAMS",
    title: "תיאום הדרכת מערכת חדשה", identifier: "TEAMS-400011", url: "#",
    status: "open", priority: "medium",
    startDate: new Date("2026-03-13"), dueDate: new Date("2026-04-05"),
    category: "תפעול", assignedToRole: "צוות תקשורת",
    updatedAt: new Date("2026-03-13"),
  },
  // === SHAREPOINT (3 tasks) ===
  {
    id: "SP-998877", source: "SHAREPOINT", systemLabel: "SHAREPOINT",
    title: "עדכון מסמכי מדיניות אבטחת מידע", identifier: "SP-998877", url: "#",
    status: "open", priority: "high", // upgraded
    startDate: new Date("2026-02-15"), dueDate: new Date("2026-04-20"),
    category: "IT", assignedToRole: "צוות אבטחה",
    updatedAt: new Date("2026-03-15"),
  },
  {
    id: "SP-200020", source: "SHAREPOINT", systemLabel: "SHAREPOINT",
    title: "מיגרציה של תיקיות משותפות", identifier: "SP-200020", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-01-30"), dueDate: new Date("2026-02-25"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-15"), overdueDays: 18,
  },
  {
    id: "SP-400012", source: "SHAREPOINT", systemLabel: "SHAREPOINT",
    title: "הקמת אתר פרויקט משותף", identifier: "SP-400012", url: "#",
    status: "open", priority: "medium",
    startDate: new Date("2026-03-10"), dueDate: new Date("2026-04-15"),
    category: "תפעול", assignedToRole: "צוות תקשורת", groupName: "צוות תקשורת",
    updatedAt: new Date("2026-03-10"),
  },
];

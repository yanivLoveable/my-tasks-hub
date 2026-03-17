import type { Task } from "@/types/task";

/**
 * Mock dataset v2 — simulates a later snapshot:
 * - Some original tasks removed (completed)
 * - Some tasks with changed priority / overdueDays
 * - A few brand-new tasks added
 * ~25 tasks
 */
export const MOCK_TASKS_V2: Task[] = [
  // === ERP (kept 3, removed ERP-112233 & ERP-200015) ===
  {
    id: "ERP-882199", source: "ERP", systemLabel: "ERP",
    title: "אישור הזמנת מחשבים ניידים", identifier: "ERP-882199", url: "#",
    status: "open", priority: "high", // upgraded from medium
    startDate: new Date("2026-02-10"), dueDate: new Date("2026-02-20"),
    category: "רכש וכספים", assignedToRole: "רכש וכספים",
    updatedAt: new Date("2026-03-10"), overdueDays: 18,
  },
  {
    id: "ERP-200001", source: "ERP", systemLabel: "ERP",
    title: "אישור דוח הוצאות רבעוני", identifier: "ERP-200001", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2025-09-10"), dueDate: new Date("2025-10-15"),
    category: "רכש וכספים", assignedToRole: "רכש וכספים",
    updatedAt: new Date("2026-03-10"), overdueDays: 146,
  },
  {
    id: "ERP-200009", source: "ERP", systemLabel: "ERP",
    title: "בדיקת יתרות ספקים", identifier: "ERP-200009", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-01-05"), dueDate: new Date("2026-02-01"),
    category: "רכש וכספים", assignedToRole: "צוות מאשרי שכר", groupName: "צוות מאשרי שכר",
    updatedAt: new Date("2026-03-10"), overdueDays: 37,
  },
  // === DOCS (kept 3, removed DOCS-200003) ===
  {
    id: "DOCS-991234", source: "DOCS_APPROVAL", systemLabel: "DOCS",
    title: "עדכון נוהל עבודה מהבית", identifier: "DOCS-991234", url: "#",
    status: "open", priority: "high", // upgraded from medium
    startDate: new Date("2025-08-15"), dueDate: new Date("2025-09-01"),
    category: "משאבי אנוש", assignedToRole: "משאבי אנוש", delegatedFrom: "שרה לוי",
    updatedAt: new Date("2026-03-10"), overdueDays: 191,
  },
  {
    id: "DOCS-889900", source: "DOCS_APPROVAL", systemLabel: "DOCS",
    title: "סקירת חוזה עם ספק חיצוני", identifier: "DOCS-889900", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2025-10-20"), dueDate: new Date("2025-11-30"),
    category: "משפטי", assignedToRole: "משפטי",
    updatedAt: new Date("2026-03-10"), overdueDays: 100,
  },
  {
    id: "DOCS-200017", source: "DOCS_APPROVAL", systemLabel: "DOCS",
    title: "סקירת הסכם שכירות משרד חדש", identifier: "DOCS-200017", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-02-22"), dueDate: new Date("2026-03-08"),
    category: "משפטי", assignedToRole: "משפטי",
    updatedAt: new Date("2026-03-10"), overdueDays: 2,
  },
  // === JIRA (kept 2, removed JIRA-200016) ===
  {
    id: "JIRA-778899", source: "JIRA", systemLabel: "JIRA",
    title: "סקירת דרישות לפרויקט דיגיטציה", identifier: "JIRA-778899", url: "#",
    status: "open", priority: "high", // upgraded
    startDate: new Date("2025-12-01"), dueDate: new Date("2026-01-10"),
    category: "תפעול", assignedToRole: "תפעול", delegatedFrom: "דני אברהם", groupName: "צוות דיגיטציה",
    updatedAt: new Date("2026-03-10"), overdueDays: 59,
  },
  {
    id: "JIRA-200002", source: "JIRA", systemLabel: "JIRA",
    title: "תיקון באג קריטי במערכת הזמנות", identifier: "JIRA-200002", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-02-01"), dueDate: new Date("2026-02-15"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-10"), overdueDays: 23,
  },
  // === SNOW (kept 3, removed SNOW-200022) ===
  {
    id: "SNOW-667788", source: "SNOW", systemLabel: "SNOW",
    title: "אישור רכישת רישיונות תוכנה", identifier: "SNOW-667788", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-01-10"), dueDate: new Date("2026-02-05"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-10"), overdueDays: 33,
  },
  {
    id: "SNOW-443312", source: "SNOW", systemLabel: "SNOW",
    title: "אישור בקשת גישה למערכת הפיתוח", identifier: "SNOW-443312", url: "#",
    status: "open", priority: "medium", // upgraded from low
    startDate: new Date("2025-11-05"), dueDate: new Date("2026-03-20"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-10"),
  },
  {
    id: "SNOW-200006", source: "SNOW", systemLabel: "SNOW",
    title: "טיפול בתקלת רשת משרדית", identifier: "SNOW-200006", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-02-28"), dueDate: new Date("2026-03-05"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-10"), overdueDays: 5,
  },
  // === CRM (kept 2, removed CRM-200004 & CRM-200018) ===
  {
    id: "CRM-556677", source: "CRM", systemLabel: "CRM",
    title: "אישור הצעת מחיר ללקוח אסטרטגי", identifier: "CRM-556677", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-02-25"), dueDate: new Date("2026-04-15"),
    category: "שיווק", assignedToRole: "שיווק",
    updatedAt: new Date("2026-03-10"),
  },
  {
    id: "CRM-200012", source: "CRM", systemLabel: "CRM",
    title: "ניתוח נטישת לקוחות Q4", identifier: "CRM-200012", url: "#",
    status: "open", priority: "high", // upgraded
    startDate: new Date("2026-01-15"), dueDate: new Date("2026-03-01"),
    category: "שיווק", assignedToRole: "שיווק",
    updatedAt: new Date("2026-03-10"), overdueDays: 9,
  },
  // === SAP (kept all 4) ===
  {
    id: "SAP-334455", source: "SAP", systemLabel: "SAP",
    title: "בדיקת חריגות בדוח הרכש הרבעוני", identifier: "SAP-334455", url: "#",
    status: "open", priority: "high", // upgraded
    startDate: new Date("2026-02-20"), dueDate: new Date("2026-05-01"),
    category: "רכש וכספים", assignedToRole: "צוות מאשרי שכר",
    updatedAt: new Date("2026-03-10"),
  },
  {
    id: "SAP-200005", source: "SAP", systemLabel: "SAP",
    title: "סגירת הזמנת רכש ישנה", identifier: "SAP-200005", url: "#",
    status: "open", priority: "high", // upgraded
    startDate: new Date("2025-11-15"), dueDate: new Date("2026-01-05"),
    category: "רכש וכספים", assignedToRole: "רכש וכספים",
    updatedAt: new Date("2026-03-10"), overdueDays: 64,
  },
  {
    id: "SAP-200013", source: "SAP", systemLabel: "SAP",
    title: "התאמת חשבוניות ספקים", identifier: "SAP-200013", url: "#",
    status: "open", priority: "low",
    startDate: new Date("2026-02-05"), dueDate: new Date("2026-04-30"),
    category: "רכש וכספים", assignedToRole: "רכש וכספים",
    updatedAt: new Date("2026-03-10"),
  },
  {
    id: "SAP-200021", source: "SAP", systemLabel: "SAP",
    title: "דוח רווח והפסד שנתי", identifier: "SAP-200021", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2025-12-01"), dueDate: new Date("2026-01-31"),
    category: "רכש וכספים", assignedToRole: "צוות מאשרי שכר",
    updatedAt: new Date("2026-03-10"), overdueDays: 38,
  },
  // === TEAMS (kept 2, removed TEAMS-200019) ===
  {
    id: "TEAMS-123456", source: "TEAMS", systemLabel: "TEAMS",
    title: "תיאום פגישת צוות רבעונית", identifier: "TEAMS-123456", url: "#",
    status: "open", priority: "low",
    startDate: new Date("2026-02-27"), dueDate: new Date("2026-06-30"),
    category: "תפעול", assignedToRole: "צוות תקשורת",
    updatedAt: new Date("2026-03-10"),
  },
  {
    id: "TEAMS-200007", source: "TEAMS", systemLabel: "TEAMS",
    title: "הכנת מצגת לישיבת הנהלה", identifier: "TEAMS-200007", url: "#",
    status: "open", priority: "high", // upgraded
    startDate: new Date("2026-02-25"), dueDate: new Date("2026-03-10"),
    category: "תפעול", assignedToRole: "תפעול",
    updatedAt: new Date("2026-03-10"),
  },
  // === SHAREPOINT (kept 2, removed SP-200020) ===
  {
    id: "SP-998877", source: "SHAREPOINT", systemLabel: "SHAREPOINT",
    title: "עדכון מסמכי מדיניות אבטחת מידע", identifier: "SP-998877", url: "#",
    status: "open", priority: "medium",
    startDate: new Date("2026-02-15"), dueDate: new Date("2026-04-20"),
    category: "IT", assignedToRole: "צוות אבטחה",
    updatedAt: new Date("2026-03-10"),
  },
  {
    id: "SP-200008", source: "SHAREPOINT", systemLabel: "SHAREPOINT",
    title: "העלאת פרוטוקול ישיבה לאתר", identifier: "SP-200008", url: "#",
    status: "open", priority: "low",
    startDate: new Date("2026-02-18"), dueDate: new Date("2026-03-15"),
    category: "תפעול", assignedToRole: "צוות תקשורת",
    updatedAt: new Date("2026-03-10"),
  },
  // === NEW TASKS (simulating newly assigned) ===
  {
    id: "ERP-300001", source: "ERP", systemLabel: "ERP",
    title: "אישור תשלום לספק בינלאומי", identifier: "ERP-300001", url: "#",
    status: "open", priority: "high",
    startDate: new Date("2026-03-08"), dueDate: new Date("2026-03-20"),
    category: "רכש וכספים", assignedToRole: "רכש וכספים",
    updatedAt: new Date("2026-03-08"),
  },
  {
    id: "JIRA-300002", source: "JIRA", systemLabel: "JIRA",
    title: "בדיקת ביצועים למודול חיפוש", identifier: "JIRA-300002", url: "#",
    status: "open", priority: "medium",
    startDate: new Date("2026-03-05"), dueDate: new Date("2026-04-10"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-05"),
  },
  {
    id: "SNOW-300003", source: "SNOW", systemLabel: "SNOW",
    title: "התקנת תחנת עבודה לעובד חדש", identifier: "SNOW-300003", url: "#",
    status: "open", priority: "medium",
    startDate: new Date("2026-03-10"), dueDate: new Date("2026-03-18"),
    category: "IT", assignedToRole: "IT",
    updatedAt: new Date("2026-03-10"),
  },
];

import { Search, ArrowUpDown, ChevronDown, X, AlertTriangle } from "lucide-react";
import type { Task, UIState, SortMode, SortDirection } from "@/types/task";
import { useMemo, useState } from "react";
import { formatDateTimeHebrew } from "@/utils/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TriangleAlert, Users, User, ArrowLeftRight } from "lucide-react";

interface FiltersBarProps {
  tasks: Task[];
  uiState: UIState;
  onSearch: (q: string) => void;
  onSystemToggle: (s: string) => void;
  onTopicToggle: (t: string) => void;
  onFlagToggle: (flag: "overdueOnly" | "groupOnly" | "delegationOnly" | "personalOnly") => void;
  onSortChange: (mode: SortMode, dir: SortDirection) => void;
  onClearAll: () => void;
  failedSystems?: Record<string, Date>;
}

// Helper: count tasks per system
const useSystemCounts = (tasks: Task[]) =>
  useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      counts[t.systemLabel] = (counts[t.systemLabel] || 0) + 1;
    }
    return counts;
  }, [tasks]);

const SORT_OPTIONS: { main: string; sub: string; mode: SortMode; dir: SortDirection }[] = [
  { main: "תאריך פתיחה", sub: "מהישן לחדש", mode: "startDate", dir: "asc" },
  { main: "תאריך פתיחה", sub: "מהחדש לישן", mode: "startDate", dir: "desc" },
  { main: "תאריך יעד", sub: "מהישן לחדש", mode: "dueDate", dir: "asc" },
  { main: "תאריך יעד", sub: "מהחדש לישן", mode: "dueDate", dir: "desc" },
];

// Primary systems shown as buttons; others go in "More" dropdown
const PRIMARY_SYSTEMS = ["SNOW", "ERP", "DOCS"];
const SYSTEM_LABELS: Record<string, string> = {
  DOCS: "אישור מסמכים",
};

export default function FiltersBar({
  tasks,
  uiState,
  onSearch,
  onSystemToggle,
  onTopicToggle,
  onFlagToggle,
  onSortChange,
  onClearAll,
  failedSystems = {},
}: FiltersBarProps) {
  const [searchInput, setSearchInput] = useState(uiState.searchQuery);

  const searchTimeout = useMemo(() => ({ id: null as ReturnType<typeof setTimeout> | null }), []);
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeout.id) clearTimeout(searchTimeout.id);
    searchTimeout.id = setTimeout(() => onSearch(value), 300);
  };

  const systems = useMemo(() => {
    const set = new Set(tasks.map((t) => t.systemLabel));
    return Array.from(set).sort();
  }, [tasks]);

  const primarySystems = useMemo(
    () => PRIMARY_SYSTEMS.filter((s) => systems.includes(s)),
    [systems]
  );

  const moreSystems = useMemo(
    () => systems.filter((s) => !PRIMARY_SYSTEMS.includes(s)),
    [systems]
  );

  const topics = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [tasks]);

  const selectedSystems = Array.isArray(uiState.selectedSystems) ? uiState.selectedSystems : [];
  const selectedTopics = Array.isArray(uiState.selectedTopics) ? uiState.selectedTopics : [];

  const hasActiveFilters =
    uiState.flags.overdueOnly ||
    uiState.flags.groupOnly ||
    uiState.flags.delegationOnly ||
    uiState.flags.personalOnly ||
    selectedSystems.length > 0 ||
    selectedTopics.length > 0;

  const systemCounts = useSystemCounts(tasks);
  const isSystemActive = (sys: string) => selectedSystems.includes(sys);
  const isTopicActive = (topic: string) => selectedTopics.includes(topic);

  // When DOCS is the only selected system, disable topics, delegation, and group
  const isDocsOnly = selectedSystems.length === 1 && selectedSystems[0] === "DOCS";

  // Systems selected from "More" dropdown that should show as tags
  const moreSelectedSystems = selectedSystems.filter((s) => !PRIMARY_SYSTEMS.includes(s));

  const getSystemLabel = (sys: string) => SYSTEM_LABELS[sys] || sys;

  // Get current sort option label for tooltip
  const getCurrentSortLabel = () => {
    const current = SORT_OPTIONS.find(
      (opt) => opt.mode === uiState.sortMode && opt.dir === uiState.sortDirection
    );
    return current ? `מיון לפי ${current.main} ${current.sub}` : "מיון";
  };

  const chipStyle = (active: boolean, disabled = false) =>
    `inline-flex items-center gap-1.5 px-3 py-0.5 border text-xs font-medium rounded-full transition-all duration-150 select-none whitespace-nowrap ${
      disabled
        ? "bg-chip-inactive-bg text-muted-foreground/25 border-chip-border/50 cursor-not-allowed"
        : active
          ? "bg-chip-active-bg text-chip-active-text border-chip-active-bg cursor-pointer"
          : "bg-chip-inactive-bg text-chip-inactive-text border-chip-border hover:bg-secondary cursor-pointer"
    }`;

  return (
    <div className="mx-auto px-6 pt-2" style={{ maxWidth: 760 }}>
      {/* Search + Sort */}
      <div className="flex items-center gap-2 mb-3">
        {/* Search bar */}
        <div className="relative flex-1 flex items-center bg-background border border-primary rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary transition-all" dir="rtl" style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="חיפוש לפי כותרת, מזהה או תאריך..."
              className="w-full h-9 pr-3 pl-8 bg-transparent border-none focus:outline-none transition-colors text-[13px]"
              dir="rtl"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
          </div>
        </div>

        {/* Sort button – icon only */}
        <DropdownMenu modal={false}>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-center bg-background border border-input text-muted-foreground hover:text-primary hover:border-primary transition-colors flex-shrink-0 cursor-pointer"
                    style={{ height: 36, width: 36, borderRadius: 4 }}
                  >
                    <ArrowUpDown size={16} />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
                {getCurrentSortLabel()}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="end" className="min-w-[200px]" style={{ direction: "rtl" }}>
            {SORT_OPTIONS.map((opt) => {
              const isActive = uiState.sortMode === opt.mode && uiState.sortDirection === opt.dir;
              return (
                <DropdownMenuItem
                  key={`${opt.mode}-${opt.dir}`}
                  onClick={() => onSortChange(opt.mode, opt.dir)}
                  className={isActive ? "bg-muted" : "hover:bg-muted/50"}
                  style={{ paddingInline: 14, paddingBlock: 7, justifyContent: "flex-start" }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: "hsl(var(--foreground))" }}>{opt.main}</span>
                  <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginInlineStart: 4 }}>{opt.sub}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* System Filter Row - centered group */}
      <div className="flex items-center justify-center mb-2.5" dir="rtl">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            className={chipStyle(selectedSystems.length === 0)}
            onClick={() => {
              if (selectedSystems.length > 0) onSystemToggle("__all__");
            }}
          >
            כלל המערכות
          </button>
          {primarySystems.map((sys) => {
            const sysFailed = failedSystems[sys];
            const button = (
              <button
                key={sys}
                className={chipStyle(isSystemActive(sys))}
                onClick={() => onSystemToggle(sys)}
              >
                {getSystemLabel(sys)}
                {systemCounts[sys] != null && (
                  <span className="text-[10px] opacity-60">({systemCounts[sys]})</span>
                )}
                {sysFailed && (
                  <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                )}
              </button>
            );
            if (sysFailed) {
              return (
                <TooltipProvider key={sys} delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
                      סונכרן לאחרונה ב-{formatDateTimeHebrew(sysFailed)}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }
            return button;
          })}
          {/* Tags for systems selected from "More" */}
          {moreSelectedSystems.map((sys) => (
            <span
              key={`tag-${sys}`}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full"
            >
              {getSystemLabel(sys)}
              <button
                onClick={() => onSystemToggle(sys)}
                className="hover:text-primary/70 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {moreSystems.length > 0 && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className={`${chipStyle(moreSelectedSystems.length > 0)} gap-1`}>
                  עוד
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]" style={{ direction: "rtl" }}>
                {moreSystems.map((sys) => (
                  <DropdownMenuItem
                    key={sys}
                    onClick={() => onSystemToggle(sys)}
                    className={isSystemActive(sys) ? "bg-primary/10 font-semibold" : ""}
                    style={{ justifyContent: "flex-start", fontSize: 13, paddingInline: 14, paddingBlock: 6 }}
                  >
                    {getSystemLabel(sys)}
                    {systemCounts[sys] != null && (
                      <span className="text-[10px] opacity-60 mr-1">({systemCounts[sys]})</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="space-y-1.5" dir="rtl">
        {/* Row 1: Topics */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            className={chipStyle(selectedTopics.length === 0, isDocsOnly)}
            onClick={() => {
              if (!isDocsOnly && selectedTopics.length > 0) {
                onTopicToggle("__all__");
              }
            }}
          >
            כל הנושאים
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              className={chipStyle(isTopicActive(topic), isDocsOnly)}
              onClick={() => !isDocsOnly && onTopicToggle(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Row 2: Special filters + clear */}
        <div className="flex items-center w-full">
          <div className="flex-1 flex items-center justify-center gap-2 flex-wrap">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={chipStyle(uiState.flags.overdueOnly)}
                    onClick={() => onFlagToggle("overdueOnly")}
                  >
                    <TriangleAlert className="w-3.5 h-3.5" />
                    חורגות
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
                  משימות בעלות תאריך יעד שעבר
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={chipStyle(uiState.flags.groupOnly, isDocsOnly)}
                    onClick={() => !isDocsOnly && onFlagToggle("groupOnly")}
                  >
                    <Users className="w-3.5 h-3.5" />
                    קבוצה
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
                  משימות שממתינות לקבוצה הכוללת אותך
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={chipStyle(uiState.flags.personalOnly, isDocsOnly)}
                    onClick={() => !isDocsOnly && onFlagToggle("personalOnly")}
                  >
                    <User className="w-3.5 h-3.5" />
                    אישי
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
                  משימות שממתינות לטיפולך האישי
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={chipStyle(uiState.flags.delegationOnly, isDocsOnly)}
                    onClick={() => !isDocsOnly && onFlagToggle("delegationOnly")}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    דליגציה
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
                  משימות שהועברו אליך מאדם אחר
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <button
            className={`text-[12px] whitespace-nowrap bg-transparent border-none p-0 transition-colors ${
              hasActiveFilters
                ? "text-primary hover:text-primary/80 underline underline-offset-2 cursor-pointer"
                : "text-muted-foreground/40 cursor-default no-underline"
            }`}
            onClick={hasActiveFilters ? onClearAll : undefined}
          >
            נקה הכל
          </button>
        </div>
      </div>
    </div>
  );
}

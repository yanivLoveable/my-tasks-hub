import { Search, ArrowUpDown } from "lucide-react";
import type { Task, UIState, SortMode, SortDirection } from "@/types/task";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TriangleAlert, Users, User, ArrowLeftRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FiltersBarProps {
  tasks: Task[];
  uiState: UIState;
  onSearch: (q: string) => void;
  onSystemChange: (s: string) => void;
  onTopicChange: (t: string) => void;
  onFlagToggle: (flag: "overdueOnly" | "groupOnly" | "delegationOnly") => void;
  onSortChange: (mode: SortMode, dir: SortDirection) => void;
  onClearAll: () => void;
}

const SORT_OPTIONS: { label: string; mode: SortMode; dir: SortDirection }[] = [
  { label: "ברירת מחדל", mode: "default", dir: "asc" },
  { label: "תאריך התחלה: ישן → חדש", mode: "startDate", dir: "asc" },
  { label: "תאריך התחלה: חדש → ישן", mode: "startDate", dir: "desc" },
  { label: "תאריך יעד (ישן לחדש)", mode: "dueDate", dir: "asc" },
  { label: "תאריך יעד (חדש לישן)", mode: "dueDate", dir: "desc" },
];

const MAX_SYSTEM_CHIPS = 5;

export default function FiltersBar({
  tasks,
  uiState,
  onSearch,
  onSystemChange,
  onTopicChange,
  onFlagToggle,
  onSortChange,
  onClearAll,
}: FiltersBarProps) {
  const [searchInput, setSearchInput] = useState(uiState.searchQuery);

  // Debounced search
  const searchTimeout = useMemo(() => ({ id: null as ReturnType<typeof setTimeout> | null }), []);
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeout.id) clearTimeout(searchTimeout.id);
    searchTimeout.id = setTimeout(() => onSearch(value), 300);
  };

  // Derive unique systems and topics
  const systems = useMemo(() => {
    const set = new Set(tasks.map((t) => t.systemLabel));
    return Array.from(set).sort();
  }, [tasks]);

  const topics = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [tasks]);

  const [showAllSystems, setShowAllSystems] = useState(false);
  const visibleSystems = showAllSystems ? systems : systems.slice(0, MAX_SYSTEM_CHIPS);
  const hasMoreSystems = systems.length > MAX_SYSTEM_CHIPS;

  const currentSortLabel =
    SORT_OPTIONS.find(
      (o) => o.mode === uiState.sortMode && o.dir === uiState.sortDirection
    )?.label ?? "תאריך יעד (ישן לחדש)";

  const hasActiveFilters =
    uiState.selectedSystem !== "all" ||
    uiState.selectedTopic !== "all" ||
    uiState.flags.overdueOnly ||
    uiState.flags.groupOnly ||
    uiState.flags.delegationOnly ||
    uiState.searchQuery.trim() !== "";

  const chipClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-1 border text-xs font-medium rounded-full transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
      active
        ? "bg-chip-active-bg text-chip-active-text border-chip-active-bg"
        : "bg-chip-inactive-bg text-chip-inactive-text border-chip-border hover:bg-secondary"
    }`;

  return (
    <div className="mx-auto px-6 pt-4" style={{ maxWidth: 720 }}>
      {/* Search + Sort */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="חיפוש לפי כותרת, מזהה או תאריך..."
            className="w-full h-10 pr-9 pl-4 bg-background border border-input rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors text-[13px]"
            dir="rtl"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 h-10 px-3 bg-background border border-input text-muted-foreground hover:text-primary hover:border-primary transition-colors flex-shrink-0 whitespace-nowrap text-[13px] rounded-lg"
              title="מיון"
            >
              <ArrowUpDown size={14} />
              <span>{currentSortLabel}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={`${opt.mode}-${opt.dir}`}
                onClick={() => onSortChange(opt.mode, opt.dir)}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter Chips */}
      <div className="space-y-2" dir="rtl">
        {/* Row 1: Systems */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            className={chipClass(uiState.selectedSystem === "all")}
            onClick={() => onSystemChange("all")}
          >
            כל המערכות
          </button>
          {visibleSystems.map((sys) => (
            <button
              key={sys}
              className={chipClass(uiState.selectedSystem === sys)}
              onClick={() => onSystemChange(sys)}
            >
              {sys}
            </button>
          ))}
          {hasMoreSystems && !showAllSystems && (
            <button
              className="inline-flex items-center gap-1 px-3 py-1 border border-border text-xs font-bold text-primary rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              onClick={() => setShowAllSystems(true)}
            >
              עוד
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          )}
        </div>

        {/* Row 2: Topics */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            className={chipClass(uiState.selectedTopic === "all")}
            onClick={() => onTopicChange("all")}
          >
            כל הנושאים
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              className={chipClass(uiState.selectedTopic === topic)}
              onClick={() => onTopicChange(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Row 3: Special filters */}
        <div className="flex items-center justify-center gap-2">
          <button
            className={chipClass(uiState.flags.overdueOnly)}
            onClick={() => onFlagToggle("overdueOnly")}
          >
            <TriangleAlert className="w-3.5 h-3.5" strokeWidth={2.5} />
            חריגות
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`${chipClass(false)} opacity-50 cursor-help`}
              >
                <User className="w-3.5 h-3.5" strokeWidth={2.5} />
                אישי
              </button>
            </TooltipTrigger>
            <TooltipContent>לא זמין בדאטה הנוכחי</TooltipContent>
          </Tooltip>

          <button
            className={chipClass(uiState.flags.groupOnly)}
            onClick={() => onFlagToggle("groupOnly")}
          >
            <Users className="w-3.5 h-3.5" strokeWidth={2.5} />
            קבוצה
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`${chipClass(false)} opacity-50 cursor-help`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                דליגציה
              </button>
            </TooltipTrigger>
            <TooltipContent>לא זמין בדאטה הנוכחי</TooltipContent>
          </Tooltip>
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <div className="flex justify-center pt-1">
            <button
              className="text-[12px] text-muted-foreground hover:text-primary transition-colors underline"
              onClick={onClearAll}
            >
              נקה הכל
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

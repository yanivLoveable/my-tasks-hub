import { Search, ArrowUpDown, ChevronDown } from "lucide-react";
import type { Task, UIState, SortMode, SortDirection } from "@/types/task";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TriangleAlert, Users, User, ArrowLeftRight } from "lucide-react";

interface FiltersBarProps {
  tasks: Task[];
  uiState: UIState;
  onSearch: (q: string) => void;
  onSystemToggle: (s: string) => void;
  onTopicToggle: (t: string) => void;
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
  onSystemToggle,
  onTopicToggle,
  onFlagToggle,
  onSortChange,
  onClearAll,
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

  const topics = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [tasks]);

  const visibleSystems = systems.slice(0, MAX_SYSTEM_CHIPS);
  const overflowSystems = systems.slice(MAX_SYSTEM_CHIPS);

  const currentSortLabel =
    SORT_OPTIONS.find(
      (o) => o.mode === uiState.sortMode && o.dir === uiState.sortDirection
    )?.label ?? "תאריך יעד (ישן לחדש)";

  const hasActiveFlags =
    uiState.flags.overdueOnly ||
    uiState.flags.groupOnly ||
    uiState.flags.delegationOnly;

  const selectedSystems = Array.isArray(uiState.selectedSystems) ? uiState.selectedSystems : [];
  const selectedTopics = Array.isArray(uiState.selectedTopics) ? uiState.selectedTopics : [];
  const isSystemActive = (sys: string) => selectedSystems.includes(sys);
  const isTopicActive = (topic: string) => selectedTopics.includes(topic);

  const chipClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3.5 py-1 border text-[13px] font-medium rounded-full transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
      active
        ? "bg-chip-active-bg text-chip-active-text border-chip-active-bg"
        : "bg-chip-inactive-bg text-chip-inactive-text border-chip-border hover:bg-secondary"
    }`;

  const chipSmallClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-0.5 border text-xs font-medium rounded-full transition-all duration-150 select-none whitespace-nowrap ${
      active
        ? "bg-chip-active-bg text-chip-active-text border-chip-active-bg cursor-pointer"
        : "bg-chip-inactive-bg text-chip-inactive-text border-chip-border hover:bg-secondary cursor-pointer"
    }`;

  return (
    <div className="mx-auto px-6 pt-5" style={{ maxWidth: 760 }}>
      {/* Search + Sort */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="חיפוש לפי כותרת, מזהה או תאריך..."
            className="w-full h-10 pr-10 pl-4 bg-background border border-input rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors text-[13px]"
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
      <div className="space-y-2.5" dir="rtl">
        {/* Row 1: Systems */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            className={chipClass(selectedSystems.length === 0)}
            onClick={() => {
              if (selectedSystems.length > 0) {
                onSystemToggle("__all__");
              }
            }}
          >
            כל המערכות
          </button>
          {visibleSystems.map((sys) => (
            <button
              key={sys}
              className={chipClass(isSystemActive(sys))}
              onClick={() => onSystemToggle(sys)}
            >
              {sys}
            </button>
          ))}
          {overflowSystems.length > 0 && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-1 px-3.5 py-1 border border-chip-border text-[13px] font-medium text-chip-inactive-text rounded-full bg-chip-inactive-bg hover:bg-secondary transition-colors cursor-pointer">
                  עוד
                  <ChevronDown size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {overflowSystems.map((sys) => (
                  <DropdownMenuItem
                    key={sys}
                    onClick={() => onSystemToggle(sys)}
                    className="text-[13px]"
                  >
                    {isSystemActive(sys) ? "✓ " : ""}{sys}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Row 2: Topics */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            className={chipClass(selectedTopics.length === 0)}
            onClick={() => {
              if (selectedTopics.length > 0) {
                onTopicToggle("__all__");
              }
            }}
          >
            כל הנושאים
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              className={chipClass(isTopicActive(topic))}
              onClick={() => onTopicToggle(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Row 3: Special filters + clear */}
        <div className="flex items-center w-full">
          <div className="flex-1 flex items-center justify-center gap-2 flex-wrap">
            <button
              className={chipSmallClass(uiState.flags.overdueOnly)}
              onClick={() => onFlagToggle("overdueOnly")}
            >
              <TriangleAlert className="w-3.5 h-3.5" />
              חורגות
            </button>

            <button
              className={`${chipSmallClass(false)} cursor-help opacity-70`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              דליגציה
            </button>

            <button
              className={`${chipSmallClass(false)} cursor-help opacity-70`}
            >
              <User className="w-3.5 h-3.5" />
              אישי
            </button>

            <button
              className={chipSmallClass(uiState.flags.groupOnly)}
              onClick={() => onFlagToggle("groupOnly")}
            >
              <Users className="w-3.5 h-3.5" />
              קבוצה
            </button>
          </div>

          <button
            className={`text-[12px] whitespace-nowrap bg-transparent border-none p-0 transition-colors ${
              hasActiveFlags
                ? "text-primary hover:text-primary/80 underline underline-offset-2 cursor-pointer"
                : "text-muted-foreground/40 cursor-default no-underline"
            }`}
            onClick={hasActiveFlags ? onClearAll : undefined}
          >
            נקה הכל
          </button>
        </div>
      </div>
    </div>
  );
}

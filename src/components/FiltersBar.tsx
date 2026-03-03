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

const SORT_OPTIONS: { main: string; sub: string; mode: SortMode; dir: SortDirection }[] = [
  { main: "תאריך יעד", sub: "(ישן לחדש)", mode: "dueDate", dir: "asc" },
  { main: "תאריך יעד", sub: "(חדש לישן)", mode: "dueDate", dir: "desc" },
  { main: "תאריך פתיחה", sub: "(ישן לחדש)", mode: "startDate", dir: "asc" },
  { main: "תאריך פתיחה", sub: "(חדש לישן)", mode: "startDate", dir: "desc" },
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

  const currentSort = SORT_OPTIONS.find(
    (o) => o.mode === uiState.sortMode && o.dir === uiState.sortDirection
  );
  const currentSortLabel = currentSort ? `${currentSort.main} ${currentSort.sub}` : "תאריך יעד (ישן לחדש)";

  const hasActiveFlags =
    uiState.flags.overdueOnly ||
    uiState.flags.groupOnly ||
    uiState.flags.delegationOnly;

  const selectedSystems = Array.isArray(uiState.selectedSystems) ? uiState.selectedSystems : [];
  const selectedTopics = Array.isArray(uiState.selectedTopics) ? uiState.selectedTopics : [];
  const isSystemActive = (sys: string) => selectedSystems.includes(sys);
  const isTopicActive = (topic: string) => selectedTopics.includes(topic);

  const chipStyle = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-0.5 border text-xs font-medium rounded-full transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
      active
        ? "bg-chip-active-bg text-chip-active-text border-chip-active-bg"
        : "bg-chip-inactive-bg text-chip-inactive-text border-chip-border hover:bg-secondary"
    }`;

  return (
    <div className="mx-auto px-6 pt-5" style={{ maxWidth: 760 }}>
      {/* Search + Sort */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
          <input
            type="text"
            placeholder="חיפוש לפי כותרת, מזהה או תאריך..."
            className="w-full h-9 pr-9 pl-9 bg-background border border-input rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors text-[13px]"
            dir="rtl"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)" }}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 bg-background border border-input text-muted-foreground hover:text-primary hover:border-primary transition-colors flex-shrink-0 whitespace-nowrap text-[13px]"
              title="מיון"
              style={{ height: 36, paddingInline: 10, borderRadius: 4 }}
            >
              <ArrowUpDown size={14} />
              <span>{currentSortLabel}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]" style={{ direction: "rtl" }}>
            {SORT_OPTIONS.map((opt) => {
              const isActive = uiState.sortMode === opt.mode && uiState.sortDirection === opt.dir;
              return (
                <DropdownMenuItem
                  key={`${opt.mode}-${opt.dir}`}
                  onClick={() => onSortChange(opt.mode, opt.dir)}
                  className={isActive ? "bg-primary/10" : ""}
                  style={{ paddingInline: 14, paddingBlock: 7 }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: "rgb(17,24,39)" }}>{opt.main}</span>
                  <span style={{ fontSize: 11, color: "rgb(156,163,175)", marginRight: 4 }}>{opt.sub}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter Chips */}
      <div className="space-y-2.5" dir="rtl">
        {/* Row 1: Systems */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            className={chipStyle(selectedSystems.length === 0)}
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
              className={chipStyle(isSystemActive(sys))}
              onClick={() => onSystemToggle(sys)}
            >
              {sys}
            </button>
          ))}
          {/* Show selected overflow systems as chips */}
          {overflowSystems.filter((sys) => isSystemActive(sys)).map((sys) => (
            <button
              key={sys}
              className={chipStyle(true)}
              onClick={() => onSystemToggle(sys)}
            >
              {sys}
            </button>
          ))}
          {overflowSystems.length > 0 && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-1 px-3 py-0.5 border border-chip-border text-xs font-medium text-chip-inactive-text rounded-full bg-chip-inactive-bg hover:bg-secondary transition-colors cursor-pointer">
                  עוד
                  <ChevronDown size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" style={{ direction: "rtl" }}>
                {overflowSystems.map((sys) => (
                  <DropdownMenuItem
                    key={sys}
                    onClick={() => onSystemToggle(sys)}
                    className={`text-[13px] ${isSystemActive(sys) ? "bg-primary/10 font-semibold" : ""}`}
                    style={{ paddingInline: 14, paddingBlock: 7 }}
                  >
                    {sys}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Row 2: Topics */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            className={chipStyle(selectedTopics.length === 0)}
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
              className={chipStyle(isTopicActive(topic))}
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
              className={chipStyle(uiState.flags.overdueOnly)}
              onClick={() => onFlagToggle("overdueOnly")}
            >
              <TriangleAlert className="w-3.5 h-3.5" />
              חורגות
            </button>

            <button
              className={`${chipStyle(false)} cursor-help opacity-70`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              דליגציה
            </button>

            <button
              className={`${chipStyle(false)} cursor-help opacity-70`}
            >
              <User className="w-3.5 h-3.5" />
              אישי
            </button>

            <button
              className={chipStyle(uiState.flags.groupOnly)}
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

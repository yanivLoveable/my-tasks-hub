import { Search, ArrowUpDown, ChevronDown } from "lucide-react";
import type { Task, UIState, SortMode, SortDirection } from "@/types/task";
import { useMemo, useState } from "react";
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

  const systemsLabel = selectedSystems.length === 0
    ? "כל המערכות"
    : selectedSystems.length === 1
      ? selectedSystems[0]
      : `${selectedSystems.length} מערכות`;

  const chipStyle = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-0.5 border text-xs font-medium rounded-full transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
      active
        ? "bg-chip-active-bg text-chip-active-text border-chip-active-bg"
        : "bg-chip-inactive-bg text-chip-inactive-text border-chip-border hover:bg-secondary"
    }`;

  return (
    <div className="mx-auto px-6 pt-5" style={{ maxWidth: 760 }}>
      {/* Search + Systems Dropdown + Sort */}
      <div className="flex items-center gap-2 mb-3">
        {/* Unified search bar with integrated systems dropdown */}
        <div className="relative flex-1 flex items-center bg-background border border-input rounded-xl overflow-hidden" dir="rtl" style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)" }}>
          {/* Systems dropdown (right side in RTL) */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 h-9 px-3 bg-transparent text-[13px] font-medium text-foreground hover:text-primary transition-colors flex-shrink-0 whitespace-nowrap cursor-pointer"
              >
                <span>{systemsLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]" style={{ direction: "rtl" }}>
              <DropdownMenuItem
                onClick={() => {
                  if (selectedSystems.length > 0) onSystemToggle("__all__");
                }}
                className={selectedSystems.length === 0 ? "bg-primary/10 font-semibold" : ""}
                style={{ justifyContent: "flex-start", fontSize: 13, paddingInline: 14, paddingBlock: 6 }}
              >
                כל המערכות
              </DropdownMenuItem>
              {systems.map((sys) => (
                <DropdownMenuItem
                  key={sys}
                  onClick={() => onSystemToggle(sys)}
                  className={isSystemActive(sys) ? "bg-primary/10 font-semibold" : ""}
                  style={{ justifyContent: "flex-start", fontSize: 13, paddingInline: 14, paddingBlock: 6 }}
                >
                  {sys}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Vertical separator */}
          <div className="w-px h-5 bg-input flex-shrink-0" />
          {/* Search input */}
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

        {/* Sort button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 bg-background border border-input text-muted-foreground hover:text-primary hover:border-primary transition-colors flex-shrink-0 whitespace-nowrap text-xs"
              title="מיון"
              style={{ height: 36, paddingInline: 10, borderRadius: 4 }}
            >
              <ArrowUpDown size={13} />
              <span className="text-xs font-medium">{currentSort?.main ?? "תאריך יעד"}</span>
              <span className="text-[10px] text-muted-foreground">{currentSort?.sub ?? "(ישן לחדש)"}</span>
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
        {/* Row 1: Topics */}
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
                    className={chipStyle(uiState.flags.groupOnly)}
                    onClick={() => onFlagToggle("groupOnly")}
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
                    className={`${chipStyle(false)} cursor-help opacity-70`}
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
                    className={`${chipStyle(false)} cursor-help opacity-70`}
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

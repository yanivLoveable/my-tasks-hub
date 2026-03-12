import { useMemo, useCallback, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { DEFAULT_UI_STATE, type UIState, type SortMode, type SortDirection } from "@/types/task";
import { filterTasks } from "@/utils/filter";
import { sortTasks } from "@/utils/sort";
import Header from "@/components/Header";
import ControlsBar from "@/components/ControlsBar";
import FiltersBar from "@/components/FiltersBar";
import TaskList from "@/components/TaskList";
import PaginationFooter from "@/components/PaginationFooter";
import Banner from "@/components/Banner";
import FeedbackModal from "@/components/FeedbackModal";
import SupportModal from "@/components/SupportModal";

const PAGE_SIZE = 20;

const Index = () => {
  const {
    tasks,
    loading,
    refreshing,
    banner,
    setBanner,
    lastUpdated,
    refresh,
    isOnCooldown,
    getCooldownTime,
    loadTasks,
  } = useTasks();

  const [footerFeedbackOpen, setFooterFeedbackOpen] = useState(false);
  const [footerSupportOpen, setFooterSupportOpen] = useState(false);

  const [uiState, setUiState] = useLocalStorageState<UIState>(
    "notifCenter.uiState",
    DEFAULT_UI_STATE
  );

  const updateUi = useCallback(
    (partial: Partial<UIState>) => {
      setUiState((prev) => ({ ...prev, ...partial }));
    },
    [setUiState]
  );

  // Validate filters against current data
  const validatedState = useMemo(() => {
    const systemLabels = new Set(tasks.map((t) => t.systemLabel));
    const categories = new Set(tasks.map((t) => t.category).filter(Boolean));

    const s = { ...uiState };
    // Migrate old single-select format
    if (!Array.isArray(s.selectedSystems)) s.selectedSystems = [];
    if (!Array.isArray(s.selectedTopics)) s.selectedTopics = [];
    
    s.selectedSystems = s.selectedSystems.filter((sys) => systemLabels.has(sys));
    s.selectedTopics = s.selectedTopics.filter((t) => categories.has(t));
    return s;
  }, [tasks, uiState]);

  const filtered = useMemo(
    () => filterTasks(tasks, validatedState),
    [tasks, validatedState]
  );

  const sorted = useMemo(
    () => sortTasks(filtered, validatedState.sortMode, validatedState.sortDirection),
    [filtered, validatedState.sortMode, validatedState.sortDirection]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(validatedState.currentPage, totalPages);
  const paginatedTasks = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSystemToggle = useCallback((sys: string) => {
    setUiState((prev) => {
      const systems = Array.isArray(prev.selectedSystems) ? prev.selectedSystems : [];
      if (sys === "__all__") {
        return { ...prev, selectedSystems: [], currentPage: 1 };
      }
      const next = systems.includes(sys)
        ? systems.filter((s) => s !== sys)
        : [...systems, sys];
      return { ...prev, selectedSystems: next, currentPage: 1 };
    });
  }, [setUiState]);

  const handleTopicToggle = useCallback((topic: string) => {
    setUiState((prev) => {
      const topics = Array.isArray(prev.selectedTopics) ? prev.selectedTopics : [];
      if (topic === "__all__") {
        return { ...prev, selectedTopics: [], currentPage: 1 };
      }
      const next = topics.includes(topic)
        ? topics.filter((t) => t !== topic)
        : [...topics, topic];
      return { ...prev, selectedTopics: next, currentPage: 1 };
    });
  }, [setUiState]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Banner */}
      <Banner
        message={banner}
        onDismiss={() => setBanner(null)}
        onRetry={banner?.type === "error" ? loadTasks : undefined}
      />

      {/* Header area – white bg */}
      <div className="bg-background border-b border-header-border pb-1.5">
        <Header
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          refreshing={refreshing}
          cooldown={isOnCooldown()}
          cooldownTime={getCooldownTime()}
        />
        <ControlsBar totalTasks={tasks.length} />
        <FiltersBar
          tasks={tasks}
          uiState={validatedState}
          onSearch={(q) => updateUi({ searchQuery: q, currentPage: 1 })}
          onSystemToggle={handleSystemToggle}
          onTopicToggle={handleTopicToggle}
          onFlagToggle={(flag) =>
            setUiState((prev) => ({
              ...prev,
              flags: { ...prev.flags, [flag]: !prev.flags[flag] },
              currentPage: 1,
            }))
          }
          onSortChange={(mode: SortMode, dir: SortDirection) =>
            updateUi({ sortMode: mode, sortDirection: dir })
          }
          onClearAll={() =>
            setUiState((prev) => ({
              ...prev,
              selectedSystems: [],
              selectedTopics: [],
              flags: { overdueOnly: false, groupOnly: false, delegationOnly: false, personalOnly: false },
              currentPage: 1,
            }))
          }
        />
      </div>

      {/* Main content – light gray bg */}
      <div className="bg-content-bg flex-1">
        <div className="mx-auto" style={{ maxWidth: 1104 }}>
          {!loading && (validatedState.selectedSystems.length > 0 || validatedState.selectedTopics.length > 0 || validatedState.flags.overdueOnly || validatedState.flags.groupOnly || validatedState.flags.delegationOnly || validatedState.flags.personalOnly || validatedState.searchQuery.trim()) && (
            <div className="flex items-center justify-center py-1.5 px-2" dir="rtl">
              <p className="text-[11px] text-muted-foreground/60">
                בהתאם לסינון, מוצגות {sorted.length} משימות
              </p>
            </div>
          )}
          <div className="pt-2">
            <TaskList
              tasks={paginatedTasks}
              loading={loading}
              hasActiveFilters={validatedState.selectedSystems.length > 0 || validatedState.selectedTopics.length > 0 || validatedState.flags.overdueOnly || validatedState.flags.groupOnly || validatedState.flags.delegationOnly || validatedState.flags.personalOnly || !!validatedState.searchQuery.trim()}
              onClearFilters={() =>
                setUiState((prev) => ({
                  ...prev,
                  searchQuery: "",
                  selectedSystems: [],
                  selectedTopics: [],
                  flags: { overdueOnly: false, groupOnly: false, delegationOnly: false, personalOnly: false },
                  currentPage: 1,
                }))
              }
            />
          </div>
          <div className="pb-2" />
        </div>
      </div>

      {/* Footer – full width like header */}
      <PaginationFooter
        currentPage={currentPage}
        totalItems={sorted.length}
        pageSize={PAGE_SIZE}
        onPageChange={(p) => { updateUi({ currentPage: p }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        onFeedbackClick={() => setFooterFeedbackOpen(true)}
        onSupportClick={() => setFooterSupportOpen(true)}
      />

      <FeedbackModal open={footerFeedbackOpen} onOpenChange={setFooterFeedbackOpen} />
      <SupportModal open={footerSupportOpen} onOpenChange={setFooterSupportOpen} />
    </div>
  );
};

export default Index;
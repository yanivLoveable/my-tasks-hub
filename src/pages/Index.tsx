import { useMemo, useCallback } from "react";
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
    if (s.selectedSystem !== "all" && !systemLabels.has(s.selectedSystem)) {
      s.selectedSystem = "all";
    }
    if (s.selectedTopic !== "all" && !categories.has(s.selectedTopic)) {
      s.selectedTopic = "all";
    }
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

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Banner */}
      <Banner
        message={banner}
        onDismiss={() => setBanner(null)}
        onRetry={banner?.type === "error" ? loadTasks : undefined}
      />

      {/* Header area with gray bg */}
      <div className="bg-header-bg border-b border-header-border pb-5">
        <Header
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          refreshing={refreshing}
          cooldown={isOnCooldown()}
          cooldownTime={getCooldownTime()}
        />
        <ControlsBar totalTasks={sorted.length} />
      </div>

      {/* Filters + Content */}
      <div className="mx-auto" style={{ maxWidth: 900 }}>
        <FiltersBar
          tasks={tasks}
          uiState={validatedState}
          onSearch={(q) => updateUi({ searchQuery: q, currentPage: 1 })}
          onSystemChange={(s) => updateUi({ selectedSystem: s, currentPage: 1 })}
          onTopicChange={(t) => updateUi({ selectedTopic: t, currentPage: 1 })}
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
              flags: { overdueOnly: false, groupOnly: false, delegationOnly: false },
              currentPage: 1,
            }))
          }
        />

        <div className="px-6">
          <TaskList tasks={paginatedTasks} loading={loading} />
        </div>

        <PaginationFooter
          currentPage={currentPage}
          totalItems={sorted.length}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => updateUi({ currentPage: p })}
        />
      </div>
    </div>
  );
};

export default Index;

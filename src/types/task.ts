export interface Task {
  id: string;
  source: string;
  systemLabel: string;
  title: string;
  identifier: string;
  url: string;
  status?: string;
  priority?: string;
  startDate?: Date;
  dueDate?: Date | null;
  category?: string;
  assignedToRole?: string;
  updatedAt?: Date;
  overdueDays?: number;
  delegatedFrom?: string;
  groupName?: string;
}

export type SortMode = "default" | "startDate" | "dueDate";
export type SortDirection = "asc" | "desc";

export interface UIState {
  searchQuery: string;
  selectedSystems: string[];
  selectedTopics: string[];
  flags: {
    overdueOnly: boolean;
    groupOnly: boolean;
    delegationOnly: boolean;
    personalOnly: boolean;
  };
  sortMode: SortMode;
  sortDirection: SortDirection;
  currentPage: number;
}

export const DEFAULT_UI_STATE: UIState = {
  searchQuery: "",
  selectedSystems: [],
  selectedTopics: [],
  flags: {
    overdueOnly: false,
    groupOnly: false,
    delegationOnly: false,
    personalOnly: false,
  },
  sortMode: "default",
  sortDirection: "asc",
  currentPage: 1,
};

// --- Flat work-item returned by GET /user-tasks ---

export interface ApiWorkItem {
  source: string;
  externalId: string;
  updatedAt: string;
  url?: string;
  title?: string;
  status?: string;
  taskId?: string;
  dueDate?: string | null;
  priority?: string | null;
  assignmentDate?: string;
  category?: string | null;
  categoryDesc?: string | null;
  subCategory?: string | null;
  subCategoryDesc?: string | null;
  taskType?: string | null;
  assignedToRole?: string | null;
  [key: string]: unknown;
}

// --- Response envelope from GET /user-tasks ---

export interface ApiResponseMetadata {
  userId: string;
  userEmail?: string;
  userName?: string;
}

export interface SourceRefreshInfo {
  lastAttemptAt: string;
  lastAttemptRunId: string;
  lastSuccessAt: string;
  lastSuccessRunId: string;
}

export interface ApiResponseSource {
  refresh: SourceRefreshInfo;
}

export interface ApiResponse {
  metadata: ApiResponseMetadata;
  data: ApiWorkItem[];
  sources: Record<string, ApiResponseSource>;
}

// --- Auth ---

export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type?: string;
}

// --- POST /refresh ---

export interface RefreshResponse {
  ok: boolean;
  runId: string;
  status: string;
  sources?: Record<string, { status: string }>;
}

// --- GET /jobs/runs/{runId} ---

export interface JobRunResponse {
  ok: boolean;
  runId: string;
  jobName?: string;
  status: "pending" | "queued" | "running" | "succeeded" | "failed";
  createdAt?: string;
  startedAt?: string;
  finishedAt?: string;
  updatedAt?: string;
  errorMessage?: string;
  result?: {
    statuses?: Record<string, string>;
  };
  sources?: Record<string, {
    status: string;
    startedAt?: string;
    finshedAt?: string;
    error?: { message: string };
    refresh?: SourceRefreshInfo;
  }>;
}

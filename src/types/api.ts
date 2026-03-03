export interface ApiWorkItemPayload {
  title?: string;
  taskID?: string;
  url?: string;
  status?: string;
  priority?: string;
  assigmentDate?: string;
  dueDate?: string;
  categoryDesc?: string;
  category?: string;
  taskType?: string;
  subCategoryDesc?: string;
  subCategory?: string;
  assignedToRole?: string;
  [key: string]: unknown;
}

export interface ApiWorkItem {
  source: string;
  external_id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  payload: ApiWorkItemPayload;
  updated_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type?: string;
}

export interface RefreshResponse {
  ok: boolean;
  runId: string;
  sources?: Record<string, { status: string }>;
}

export interface JobRunResponse {
  status: "pending" | "running" | "succeeded" | "failed";
  errorMessage?: string;
  result?: {
    sources?: Record<string, { status: string; error?: string }>;
  };
}

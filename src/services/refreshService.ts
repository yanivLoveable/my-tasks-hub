import { httpPost, httpGet } from "./http";
import type { RefreshResponse, JobRunResponse } from "@/types/api";

export async function triggerRefresh(token: string): Promise<RefreshResponse> {
  return httpPost<RefreshResponse>(
    `/api/work-items/user-tasks/refresh`,
    token
  );
}

export async function pollJobStatus(token: string, runId: string, signal?: AbortSignal): Promise<JobRunResponse> {
  return httpGet<JobRunResponse>(`/api/jobs/runs/${runId}`, token, signal);
}

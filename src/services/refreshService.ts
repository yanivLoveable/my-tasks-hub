import { USER_ID } from "@/config";
import { httpGet, httpPost } from "./http";
import type { RefreshResponse } from "@/types/api";

export async function triggerRefresh(token: string): Promise<RefreshResponse> {
  return httpPost<RefreshResponse>(
    `/api/work-items/user-tasks/refresh?userId=${encodeURIComponent(USER_ID)}`,
    undefined,
    { Authorization: `Bearer ${token}` }
  );
}

export async function pollJobStatus(
  token: string,
  runId: string,
  signal?: AbortSignal
): Promise<import("@/types/api").JobRunResponse> {
  return httpGet<import("@/types/api").JobRunResponse>(
    `/api/jobs/runs/${runId}`,
    token,
    signal
  );
}

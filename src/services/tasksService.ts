import { httpGet } from "./http";
import type { ApiWorkItem, ApiResponse, ApiResponseSource } from "@/types/api";

export interface FetchTasksResult {
  items: ApiWorkItem[];
  sources: Record<string, ApiResponseSource>;
}

export async function fetchUserTasks(
  token: string,
  signal?: AbortSignal
): Promise<FetchTasksResult> {
  const params = new URLSearchParams({
    limit: "200",
    offset: "0",
  });

  const res = await httpGet<ApiResponse>(
    `/api/work-items/user-tasks?${params.toString()}`,
    token,
    signal
  );

  return {
    items: res.data ?? [],
    sources: res.sources ?? {},
  };
}

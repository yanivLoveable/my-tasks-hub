import { httpGet } from "./http";
import type { ApiWorkItem } from "@/types/api";

export async function fetchUserTasks(
  token: string,
  userId: string,
  signal?: AbortSignal
): Promise<ApiWorkItem[]> {
  return httpGet<ApiWorkItem[]>(
    `/api/work-items/user-tasks?userId=${encodeURIComponent(userId)}`,
    token,
    signal
  );
}
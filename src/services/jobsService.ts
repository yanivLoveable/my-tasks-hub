import { pollJobStatus } from "./refreshService";
import type { JobRunResponse } from "@/types/api";

const POLL_INTERVAL = 1000;
const POLL_TIMEOUT = 30000;

export async function waitForJob(
  token: string,
  runId: string,
  onUpdate?: (status: string) => void,
  signal?: AbortSignal
): Promise<JobRunResponse> {
  const start = Date.now();

  while (true) {
    if (signal?.aborted) throw new Error("Polling aborted");
    if (Date.now() - start > POLL_TIMEOUT) {
      throw new Error("Polling timeout: job took too long");
    }

    const result = await pollJobStatus(token, runId, signal);
    onUpdate?.(result.status);

    if (result.status === "succeeded" || result.status === "failed") {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }
}

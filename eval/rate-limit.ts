import { setTimeout as sleep } from "node:timers/promises";

export function isRateLimit(
  error: unknown,
): error is { status: 429; retryAfter?: string | null } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 429
  );
}

export function isConnectTimeout(error: unknown) {
  return (
    error instanceof Error &&
    typeof error.cause === "object" &&
    error.cause !== null &&
    "code" in error.cause &&
    error.cause.code === "UND_ERR_CONNECT_TIMEOUT"
  );
}

export async function withRateLimitRetry<T>(
  request: () => Promise<T>,
  wait: (ms: number) => Promise<unknown> = sleep,
) {
  for (let retries = 0; ; retries++) {
    try {
      return await request();
    } catch (error) {
      if (retries >= 3) throw error;
      if (isConnectTimeout(error)) {
        await wait(1000 * 2 ** retries);
        continue;
      }
      if (!isRateLimit(error)) throw error;
      const header = error.retryAfter?.trim();
      const seconds =
        header && /^\d+(?:\.\d+)?$/.test(header) ? Number(header) : NaN;
      const hinted = Number.isFinite(seconds)
        ? seconds * 1000
        : Date.parse(header ?? "") - Date.now();
      const delay = Number.isFinite(hinted)
        ? Math.max(0, hinted)
        : 15000 * 2 ** retries;
      if (delay > 120000) throw error;
      await wait(Number.isFinite(hinted) ? delay + 2000 : delay);
    }
  }
}

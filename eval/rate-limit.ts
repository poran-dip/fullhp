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

export async function withRateLimitRetry<T>(
  request: () => Promise<T>,
  wait: (ms: number) => Promise<unknown> = sleep,
) {
  for (let retries = 0; ; retries++) {
    try {
      return await request();
    } catch (error) {
      if (!isRateLimit(error) || retries >= 3) throw error;
      const header = error.retryAfter?.trim();
      const seconds =
        header && /^\d+(?:\.\d+)?$/.test(header) ? Number(header) : NaN;
      const hinted = Number.isFinite(seconds)
        ? seconds * 1000
        : Date.parse(header ?? "") - Date.now();
      const delay = Number.isFinite(hinted)
        ? Math.max(1000, hinted)
        : 15000 * 2 ** retries;
      if (delay > 120000) throw error;
      console.warn(
        `Rate limited. Retrying this case in ${Math.ceil(delay / 1000)}s (${retries + 1}/3).`,
      );
      await wait(delay);
    }
  }
}

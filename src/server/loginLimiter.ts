const MAX_FAILURES = 20;
const WINDOW_MS = 15 * 60 * 1000; // 15 mins.

type Failures = { count: number; resetAt: number };

type LoginLimiterOptions = {
  maxFailures?: number;
  windowMs?: number;
};

// in memory rate limiter for password attempts.
export const createLoginLimiter = ({
  maxFailures = MAX_FAILURES,
  windowMs = WINDOW_MS,
}: LoginLimiterOptions = {}) => {
  const failuresByKey = new Map<string, Failures>();

  const getFailures = (key: string, now: number) => {
    const failures = failuresByKey.get(key);
    if (!failures || failures.resetAt <= now) {
      failuresByKey.delete(key);
      return undefined;
    }

    return failures;
  };

  return {
    clearFailures: (key: string) => {
      failuresByKey.delete(key);
    },
    getRetryAfterSeconds: (key: string, now = Date.now()) => {
      const failures = getFailures(key, now);
      if (!failures || failures.count < maxFailures) {
        return undefined;
      }

      return Math.ceil((failures.resetAt - now) / 1000);
    },
    recordFailure: (key: string, now = Date.now()) => {
      const failures = getFailures(key, now) ?? {
        count: 0,
        resetAt: now + windowMs,
      };
      failures.count += 1;
      failuresByKey.set(key, failures);
    },
  };
};

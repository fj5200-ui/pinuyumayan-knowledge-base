export type RetryDecision = {
  retryable: boolean;
  nextDelaySeconds: number | null;
  deadLetter: boolean;
};

export function decideRetry(attempt: number, errorCode?: string): RetryDecision {
  const nonRetryable = new Set(["invalid_license", "schema_validation_failed", "restricted_sensitive_content"]);
  if (errorCode && nonRetryable.has(errorCode)) {
    return { retryable: false, nextDelaySeconds: null, deadLetter: true };
  }
  if (attempt >= 5) {
    return { retryable: false, nextDelaySeconds: null, deadLetter: true };
  }
  const nextDelaySeconds = Math.min(3600, 30 * Math.pow(2, Math.max(0, attempt - 1)));
  return { retryable: true, nextDelaySeconds, deadLetter: false };
}

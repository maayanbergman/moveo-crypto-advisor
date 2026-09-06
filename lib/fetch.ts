/**
 * Fetch with a hard AbortController timeout.
 * On abort/timeout the caller should catch and use fallback data.
 */
export async function fetchWithTimeout(
  input: string | URL,
  init: RequestInit & { timeoutMs: number },
): Promise<Response> {
  const { timeoutMs, signal: outerSignal, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const onOuterAbort = () => controller.abort();
  if (outerSignal) {
    if (outerSignal.aborted) {
      clearTimeout(timer);
      controller.abort();
    } else {
      outerSignal.addEventListener("abort", onOuterAbort, { once: true });
    }
  }

  try {
    return await fetch(input, {
      ...rest,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
    outerSignal?.removeEventListener("abort", onOuterAbort);
  }
}

export const EXTERNAL_API_TIMEOUT_MS = 5_000;
export const AI_API_TIMEOUT_MS = 8_000;

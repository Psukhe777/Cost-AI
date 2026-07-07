export function fallbackShellUserData() {
  return {
    id: "local-fallback",
    email: "local@cost.ai",
    apiSecretPreview: "unavailable",
    budgetUsd: 0,
    usedUsd: 0
  };
}

export function fallbackMetrics() {
  return {
    usedUsd: 0,
    budgetUsd: 0,
    savedUsd: 0,
    totalTokens: 0,
    localTokens: 0,
    cloudTokens: 0,
    avgLatencyMs: 0,
    avgTtftMs: 0,
    requestCount: 0
  };
}

export async function safeQuery<T>(
  scope: string,
  query: () => Promise<T>,
  fallback: T
) {
  try {
    return await query();
  } catch (error) {
    console.error(`[cost-ai-v2:${scope}]`, error);
    return fallback;
  }
}

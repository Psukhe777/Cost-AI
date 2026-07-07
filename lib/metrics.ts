import { percent, toNumber } from "@/lib/money";

export function safeRate(totalTokens: number, latencyMs?: number | null) {
  if (!latencyMs || latencyMs <= 0) return 0;
  return totalTokens / (latencyMs / 1000);
}

export function budgetUsagePercent(usedUsd: unknown, budgetUsd: unknown) {
  return percent(usedUsd, budgetUsd);
}

export function average(values: Array<number | null | undefined>) {
  const clean = values
    .filter((value) => value !== null && value !== undefined)
    .map(toNumber);
  if (clean.length === 0) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

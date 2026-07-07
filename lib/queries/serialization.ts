import type { UsageLog } from "@prisma/client";
import { toNumber } from "@/lib/money";
import type { SerializedLog } from "@/lib/types";
import {
  MODEL_TYPE_CLOUD,
  MODEL_TYPE_LOCAL,
  type ModelTypeValue
} from "@/lib/queries/constants";

export function normalizeModelType(
  modelType: string | null | undefined
): ModelTypeValue {
  return modelType === MODEL_TYPE_LOCAL ? MODEL_TYPE_LOCAL : MODEL_TYPE_CLOUD;
}

function parseTags(tagsJson: string | null | undefined): string[] {
  if (!tagsJson) return [];

  try {
    const parsed = JSON.parse(tagsJson) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((tag) => String(tag).trim())
      .filter(Boolean)
      .slice(0, 24);
  } catch {
    return [];
  }
}

export function serializeLog(log: UsageLog): SerializedLog {
  return {
    id: log.id,
    createdAt: log.createdAt.toISOString(),
    provider: log.provider,
    model: log.model,
    modelType: normalizeModelType(log.modelType),
    projectId: log.projectKey,
    agentName: log.agentName,
    agentId: log.agentId,
    tags: parseTags(log.tagsJson),
    requestName: log.requestName,
    promptTokens: log.promptTokens,
    completionTokens: log.completionTokens,
    totalTokens: log.totalTokens,
    costUsd: toNumber(log.costUsd ?? 0),
    ttftMs: log.ttftMs,
    latencyMs: log.latencyMs,
    tps: toNumber(log.tps ?? 0)
  };
}

export function apiSecretPreview(apiSecret: string) {
  return `${apiSecret.slice(0, 8)}...${apiSecret.slice(-5)}`;
}

import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";
import { estimateBaselineSavingsUsd } from "@/lib/pricing";
import {
  MODEL_TYPE_CLOUD,
  MODEL_TYPE_LOCAL
} from "@/lib/queries/constants";
import {
  fallbackMetrics,
  fallbackShellUserData,
  safeQuery
} from "@/lib/queries/fallbacks";
import {
  apiSecretPreview,
  normalizeModelType
} from "@/lib/queries/serialization";

export async function getShellUserData(userId: string) {
  return safeQuery(
    "shell-user-query",
    async () => {
      const [user, usageTotals] = await Promise.all([
        db.user.findUniqueOrThrow({
          where: { id: userId }
        }),
        db.usageLog.aggregate({
          where: { userId },
          _sum: {
            costUsd: true
          }
        })
      ]);

      return {
        id: user.id,
        email: user.email,
        apiSecretPreview: apiSecretPreview(user.apiSecret),
        budgetUsd: toNumber(user.budgetUsd),
        usedUsd: toNumber(usageTotals._sum.costUsd ?? 0)
      };
    },
    fallbackShellUserData()
  );
}

export async function getUsageOverviewData(userId: string) {
  return safeQuery(
    "usage-overview-query",
    async () => {
      const [user, usageTotals, modelTypeGroups] = await Promise.all([
        db.user.findUniqueOrThrow({
          where: { id: userId }
        }),
        db.usageLog.aggregate({
          where: { userId },
          _sum: {
            costUsd: true,
            totalTokens: true
          },
          _avg: {
            latencyMs: true,
            ttftMs: true
          },
          _count: {
            _all: true
          }
        }),
        db.usageLog.groupBy({
          by: ["modelType"],
          where: { userId },
          _sum: {
            promptTokens: true,
            completionTokens: true,
            totalTokens: true
          },
          _count: {
            _all: true
          }
        })
      ]);

      const localTotals = modelTypeGroups.find(
        (row) => normalizeModelType(row.modelType) === MODEL_TYPE_LOCAL
      );
      const cloudTotals = modelTypeGroups.find(
        (row) => normalizeModelType(row.modelType) === MODEL_TYPE_CLOUD
      );
      const usedUsd = toNumber(usageTotals._sum.costUsd ?? 0);
      const localPromptTokens = toNumber(localTotals?._sum.promptTokens ?? 0);
      const localCompletionTokens = toNumber(
        localTotals?._sum.completionTokens ?? 0
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          apiSecretPreview: apiSecretPreview(user.apiSecret),
          budgetUsd: toNumber(user.budgetUsd),
          usedUsd
        },
        metrics: {
          usedUsd,
          budgetUsd: toNumber(user.budgetUsd),
          savedUsd: estimateBaselineSavingsUsd({
            promptTokens: localPromptTokens,
            completionTokens: localCompletionTokens
          }),
          totalTokens: toNumber(usageTotals._sum.totalTokens ?? 0),
          localTokens: toNumber(localTotals?._sum.totalTokens ?? 0),
          cloudTokens: toNumber(cloudTotals?._sum.totalTokens ?? 0),
          avgLatencyMs: toNumber(usageTotals._avg.latencyMs ?? 0),
          avgTtftMs: toNumber(usageTotals._avg.ttftMs ?? 0),
          requestCount: usageTotals._count._all ?? 0
        }
      };
    },
    {
      user: fallbackShellUserData(),
      metrics: fallbackMetrics()
    }
  );
}

export async function getSafeMeData(userId: string) {
  return safeQuery(
    "me-query",
    async () => {
      const overview = await getUsageOverviewData(userId);

      return {
        user: {
          id: overview.user.id,
          email: overview.user.email,
          budgetUsd: overview.user.budgetUsd,
          usedUsd: overview.user.usedUsd
        },
        metrics: overview.metrics
      };
    },
    {
      user: {
        id: fallbackShellUserData().id,
        email: fallbackShellUserData().email,
        budgetUsd: 0,
        usedUsd: 0
      },
      metrics: fallbackMetrics()
    }
  );
}

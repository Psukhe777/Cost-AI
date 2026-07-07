import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";
import { estimateBaselineSavingsUsd } from "@/lib/pricing";
import type {
  AgentTagBreakdown,
  BurnRateSnapshot,
  ModelBreakdown,
  PerformanceCostPoint,
  SparklinePoint,
  TimeSeriesPoint
} from "@/lib/types";
import {
  MODEL_TYPE_CLOUD,
  MODEL_TYPE_LOCAL,
  TAG_WINDOW_HOURS
} from "@/lib/queries/constants";
import {
  fallbackMetrics,
  fallbackShellUserData,
  safeQuery
} from "@/lib/queries/fallbacks";
import {
  buildProjectBreakdown,
  type ProjectAggregateRow
} from "@/lib/queries/projects";
import {
  apiSecretPreview,
  normalizeModelType,
  serializeLog
} from "@/lib/queries/serialization";

type TimeSeriesAggregateRow = {
  date: string | null;
  promptTokens: number | bigint | null;
  completionTokens: number | bigint | null;
  totalTokens: number | bigint | null;
  costUsd: unknown;
};

type AgentTagAggregateRow = {
  attributionKey: string | null;
  attributionType: "agent" | "tag" | null;
  hourBucket: string | null;
  costUsd: unknown;
  totalTokens: number | bigint | null;
  callCount: number | bigint | null;
  avgLatencyMs: unknown;
};

type PerformanceCostAggregateRow = {
  model: string | null;
  costUsd: unknown;
  avgLatencyMs: unknown;
  avgTtftMs: unknown;
  avgTps: unknown;
};

function buildBurnRateSnapshot(args: {
  currentTokens: number;
  previousTokens: number;
}): BurnRateSnapshot {
  const currentTokensPerMinute = args.currentTokens / 5;
  const previousTokensPerMinute = args.previousTokens / 60;
  const spikePercent =
    previousTokensPerMinute > 0
      ? ((currentTokensPerMinute - previousTokensPerMinute) /
          previousTokensPerMinute) *
        100
      : 0;

  return {
    anomalyDetected: previousTokensPerMinute > 0 && spikePercent > 300,
    currentTokens: args.currentTokens,
    previousTokens: args.previousTokens,
    currentTokensPerMinute,
    previousTokensPerMinute,
    spikePercent: Math.max(0, spikePercent)
  };
}

function fallbackDashboardData() {
  return {
    user: fallbackShellUserData(),
    metrics: fallbackMetrics(),
    burnRate: buildBurnRateSnapshot({
      currentTokens: 0,
      previousTokens: 0
    }),
    logs: [],
    timeSeries: [],
    byModel: [],
    byProject: [],
    byAgentTag: [],
    performanceCost: []
  };
}

function buildTimeSeries(rows: TimeSeriesAggregateRow[]): TimeSeriesPoint[] {
  return (rows ?? []).map((row) => ({
    date: row.date ?? "",
    promptTokens: toNumber(row.promptTokens ?? 0),
    completionTokens: toNumber(row.completionTokens ?? 0),
    totalTokens: toNumber(row.totalTokens ?? 0),
    costUsd: toNumber(row.costUsd ?? 0)
  }));
}

function buildHourBuckets(referenceDate = new Date()) {
  const end = new Date(referenceDate);
  end.setUTCMinutes(0, 0, 0);

  return Array.from({ length: TAG_WINDOW_HOURS }, (_, index) => {
    const date = new Date(end);
    date.setUTCHours(end.getUTCHours() - (TAG_WINDOW_HOURS - 1 - index));

    return {
      key: `${date.toISOString().slice(0, 13)}:00:00.000Z`,
      label: `${String(date.getUTCHours()).padStart(2, "0")}:00`
    };
  });
}

function buildAgentTagBreakdown(
  rows: AgentTagAggregateRow[]
): AgentTagBreakdown[] {
  const buckets = buildHourBuckets();
  const groups = new Map<
    string,
    {
      key: string;
      type: "agent" | "tag";
      totalCostUsd: number;
      totalTokens: number;
      callCount: number;
      latencyWeightedTotal: number;
      hourlyCost: Map<string, number>;
    }
  >();

  for (const row of rows ?? []) {
    const attributionKey = row.attributionKey?.trim() || "default-agent";
    const attributionType = row.attributionType === "tag" ? "tag" : "agent";
    const groupKey = `${attributionType}:${attributionKey}`;
    const group =
      groups.get(groupKey) ??
      ({
        key: attributionKey,
        type: attributionType,
        totalCostUsd: 0,
        totalTokens: 0,
        callCount: 0,
        latencyWeightedTotal: 0,
        hourlyCost: new Map<string, number>()
      } satisfies {
        key: string;
        type: "agent" | "tag";
        totalCostUsd: number;
        totalTokens: number;
        callCount: number;
        latencyWeightedTotal: number;
        hourlyCost: Map<string, number>;
      });

    const costUsd = toNumber(row.costUsd ?? 0);
    const totalTokens = toNumber(row.totalTokens ?? 0);
    const callCount = toNumber(row.callCount ?? 0);
    const avgLatencyMs = toNumber(row.avgLatencyMs ?? 0);
    const hourBucket = row.hourBucket ?? "";

    group.totalCostUsd += costUsd;
    group.totalTokens += totalTokens;
    group.callCount += callCount;
    group.latencyWeightedTotal += avgLatencyMs * callCount;
    group.hourlyCost.set(
      hourBucket,
      (group.hourlyCost.get(hourBucket) ?? 0) + costUsd
    );
    groups.set(groupKey, group);
  }

  return Array.from(groups.values())
    .map((group) => {
      const sparkline: SparklinePoint[] = buckets.map((bucket) => ({
        hour: bucket.label,
        costUsd: group.hourlyCost.get(bucket.key) ?? 0
      }));

      return {
        key: group.key,
        type: group.type,
        totalCostUsd: group.totalCostUsd,
        totalTokens: group.totalTokens,
        callCount: group.callCount,
        avgLatencyMs:
          group.callCount > 0 ? group.latencyWeightedTotal / group.callCount : 0,
        sparkline
      };
    })
    .sort((a, b) => b.totalCostUsd - a.totalCostUsd);
}

function buildPerformanceCostMatrix(
  rows: PerformanceCostAggregateRow[]
): PerformanceCostPoint[] {
  return (rows ?? []).map((row) => ({
    model: row.model ?? "unknown",
    costUsd: toNumber(row.costUsd ?? 0),
    avgLatencyMs: toNumber(row.avgLatencyMs ?? 0),
    avgTtftMs: toNumber(row.avgTtftMs ?? 0),
    avgTps: toNumber(row.avgTps ?? 0)
  }));
}

export async function getDashboardData(userId: string) {
  return safeQuery(
    "dashboard-query",
    async () => {
      const now = new Date();
      const currentWindowStart = new Date(now.getTime() - 5 * 60 * 1000);
      const previousWindowStart = new Date(
        currentWindowStart.getTime() - 60 * 60 * 1000
      );
      const tagWindowStart = new Date(
        now.getTime() - TAG_WINDOW_HOURS * 60 * 60 * 1000
      );

      const [
        user,
        rawLogs,
        usageTotals,
        modelTypeGroups,
        modelGroups,
        timeSeriesRows,
        projectGroups,
        currentWindowTotals,
        previousWindowTotals,
        agentTagRows,
        performanceCostRows
      ] = await Promise.all([
        db.user.findUniqueOrThrow({
          where: { id: userId }
        }),
        db.usageLog.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 25
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
        }),
        db.usageLog.groupBy({
          by: ["model", "modelType"],
          where: { userId },
          _sum: {
            promptTokens: true,
            completionTokens: true,
            totalTokens: true,
            costUsd: true
          },
          _count: {
            _all: true
          }
        }),
        db.$queryRaw<TimeSeriesAggregateRow[]>`
          SELECT
            date(created_at) AS "date",
            COALESCE(SUM(prompt_tokens), 0) AS "promptTokens",
            COALESCE(SUM(completion_tokens), 0) AS "completionTokens",
            COALESCE(SUM(total_tokens), 0) AS "totalTokens",
            CAST(COALESCE(SUM(cost_usd), 0.0) AS REAL) AS "costUsd"
          FROM usage_logs
          WHERE user_id = ${userId}
          GROUP BY date(created_at)
          ORDER BY date ASC
        `,
        db.$queryRaw<ProjectAggregateRow[]>`
          SELECT
            project_id AS "projectKey",
            agent_name AS "agentName",
            COALESCE(SUM(total_tokens), 0) AS "totalTokens",
            CAST(COALESCE(SUM(CASE WHEN model_type = ${MODEL_TYPE_CLOUD} THEN cost_usd ELSE 0.0 END), 0.0) AS REAL) AS "cloudSpendUsd",
            COALESCE(SUM(CASE WHEN model_type = ${MODEL_TYPE_LOCAL} THEN total_tokens ELSE 0 END), 0) AS "localTokens",
            COALESCE(SUM(CASE WHEN model_type = ${MODEL_TYPE_LOCAL} THEN prompt_tokens ELSE 0 END), 0) AS "localPromptTokens",
            COALESCE(SUM(CASE WHEN model_type = ${MODEL_TYPE_LOCAL} THEN completion_tokens ELSE 0 END), 0) AS "localCompletionTokens"
          FROM usage_logs
          WHERE user_id = ${userId}
          GROUP BY project_id, agent_name
          ORDER BY "cloudSpendUsd" + "localPromptTokens" + "localCompletionTokens" DESC
        `,
        db.usageLog.aggregate({
          where: {
            userId,
            createdAt: {
              gte: currentWindowStart,
              lte: now
            }
          },
          _sum: {
            totalTokens: true
          },
          _count: {
            _all: true
          }
        }),
        db.usageLog.aggregate({
          where: {
            userId,
            createdAt: {
              gte: previousWindowStart,
              lt: currentWindowStart
            }
          },
          _sum: {
            totalTokens: true
          },
          _count: {
            _all: true
          }
        }),
        db.$queryRaw<AgentTagAggregateRow[]>`
          WITH attribution AS (
            SELECT
              COALESCE(NULLIF(agent_id, ''), NULLIF(agent_name, ''), 'default-agent') AS "attributionKey",
              'agent' AS "attributionType",
              strftime('%Y-%m-%dT%H:00:00.000Z', created_at) AS "hourBucket",
              cost_usd AS "costUsd",
              total_tokens AS "totalTokens",
              latency_ms AS "latencyMs"
            FROM usage_logs
            WHERE user_id = ${userId}
              AND created_at >= ${tagWindowStart}

            UNION ALL

            SELECT
              '#' || json_each.value AS "attributionKey",
              'tag' AS "attributionType",
              strftime('%Y-%m-%dT%H:00:00.000Z', usage_logs.created_at) AS "hourBucket",
              usage_logs.cost_usd AS "costUsd",
              usage_logs.total_tokens AS "totalTokens",
              usage_logs.latency_ms AS "latencyMs"
            FROM usage_logs, json_each(CASE
              WHEN tags_json IS NULL OR tags_json = '' THEN '[]'
              ELSE tags_json
            END)
            WHERE usage_logs.user_id = ${userId}
              AND usage_logs.created_at >= ${tagWindowStart}
          )
          SELECT
            "attributionKey",
            "attributionType",
            "hourBucket",
            CAST(COALESCE(SUM("costUsd"), 0.0) AS REAL) AS "costUsd",
            COALESCE(SUM("totalTokens"), 0) AS "totalTokens",
            COALESCE(COUNT(*), 0) AS "callCount",
            CAST(COALESCE(AVG(COALESCE("latencyMs", 0)), 0.0) AS REAL) AS "avgLatencyMs"
          FROM attribution
          GROUP BY "attributionKey", "attributionType", "hourBucket"
          ORDER BY "costUsd" DESC
        `,
        db.$queryRaw<PerformanceCostAggregateRow[]>`
          SELECT
            model AS "model",
            CAST(COALESCE(SUM(cost_usd), 0.0) AS REAL) AS "costUsd",
            CAST(COALESCE(AVG(COALESCE(latency_ms, 0)), 0.0) AS REAL) AS "avgLatencyMs",
            CAST(COALESCE(AVG(COALESCE(ttft_ms, 0)), 0.0) AS REAL) AS "avgTtftMs",
            CAST(COALESCE(AVG(COALESCE(tps, 0.0)), 0.0) AS REAL) AS "avgTps"
          FROM usage_logs
          WHERE user_id = ${userId}
          GROUP BY model
          ORDER BY "costUsd" DESC
          LIMIT 12
        `
      ]);

      const logs = rawLogs.map(serializeLog);
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
      const totalTokens = toNumber(usageTotals._sum.totalTokens ?? 0);
      const localTokens = toNumber(localTotals?._sum.totalTokens ?? 0);
      const cloudTokens = toNumber(cloudTotals?._sum.totalTokens ?? 0);
      const avgLatencyMs = usageTotals._avg.latencyMs ?? 0;
      const avgTtftMs = usageTotals._avg.ttftMs ?? 0;
      const savedUsd = estimateBaselineSavingsUsd({
        promptTokens: localPromptTokens,
        completionTokens: localCompletionTokens
      });

      const byModel: ModelBreakdown[] = modelGroups.map((row) => ({
        model: row.model,
        modelType: normalizeModelType(row.modelType),
        promptTokens: toNumber(row._sum.promptTokens ?? 0),
        completionTokens: toNumber(row._sum.completionTokens ?? 0),
        totalTokens: toNumber(row._sum.totalTokens ?? 0),
        costUsd: toNumber(row._sum.costUsd ?? 0)
      }));

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
          savedUsd,
          totalTokens,
          localTokens,
          cloudTokens,
          avgLatencyMs: toNumber(avgLatencyMs ?? 0),
          avgTtftMs: toNumber(avgTtftMs ?? 0),
          requestCount: usageTotals._count._all ?? 0
        },
        burnRate: buildBurnRateSnapshot({
          currentTokens: toNumber(currentWindowTotals._sum.totalTokens ?? 0),
          previousTokens: toNumber(previousWindowTotals._sum.totalTokens ?? 0)
        }),
        logs,
        timeSeries: buildTimeSeries(timeSeriesRows),
        byModel,
        byProject: buildProjectBreakdown(projectGroups),
        byAgentTag: buildAgentTagBreakdown(agentTagRows),
        performanceCost: buildPerformanceCostMatrix(performanceCostRows)
      };
    },
    fallbackDashboardData()
  );
}

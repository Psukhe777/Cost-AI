import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";
import { estimateBaselineSavingsUsd } from "@/lib/pricing";
import type { ProjectBreakdown } from "@/lib/types";
import {
  MODEL_TYPE_CLOUD,
  MODEL_TYPE_LOCAL
} from "@/lib/queries/constants";
import {
  fallbackMetrics,
  fallbackShellUserData,
  safeQuery
} from "@/lib/queries/fallbacks";
import { getUsageOverviewData } from "@/lib/queries/overview";

export type ProjectAggregateRow = {
  projectKey: string | null;
  agentName: string | null;
  totalTokens: number | bigint | null;
  cloudSpendUsd: unknown;
  localTokens: number | bigint | null;
  localPromptTokens: number | bigint | null;
  localCompletionTokens: number | bigint | null;
};

export function buildProjectBreakdown(
  groups: ProjectAggregateRow[]
): ProjectBreakdown[] {
  return (groups ?? [])
    .map((group) => ({
      projectId: group.projectKey ?? "untagged",
      agentName: group.agentName ?? "default-agent",
      totalTokens: toNumber(group.totalTokens ?? 0),
      cloudSpendUsd: toNumber(group.cloudSpendUsd ?? 0),
      localTokens: toNumber(group.localTokens ?? 0),
      savedUsd: estimateBaselineSavingsUsd({
        promptTokens: toNumber(group.localPromptTokens ?? 0),
        completionTokens: toNumber(group.localCompletionTokens ?? 0)
      })
    }))
    .sort((a, b) => b.cloudSpendUsd + b.savedUsd - (a.cloudSpendUsd + a.savedUsd));
}

export async function getProjectsPageData(userId: string) {
  return safeQuery(
    "projects-page-query",
    async () => {
      const [overview, projectGroups] = await Promise.all([
        getUsageOverviewData(userId),
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
        `
      ]);

      return {
        ...overview,
        byProject: buildProjectBreakdown(projectGroups)
      };
    },
    {
      user: fallbackShellUserData(),
      metrics: fallbackMetrics(),
      byProject: []
    }
  );
}

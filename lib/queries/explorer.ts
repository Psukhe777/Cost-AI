mport { db } from "@/lib/db";
import {
  fallbackShellUserData,
  safeQuery
} from "@/lib/queries/fallbacks";
import { getShellUserData } from "@/lib/queries/overview";
import { serializeLog } from "@/lib/queries/serialization";

export async function getExplorerPageData(userId: string, query?: string) {
  return safeQuery(
    "explorer-page-query",
    async () => {
      const [user, logs] = await Promise.all([
        getShellUserData(userId),
        getExplorerData(userId, query)
      ]);

      return { user, logs };
    },
    {
      user: fallbackShellUserData(),
      logs: []
    }
  );
}

export async function getExplorerData(userId: string, query?: string) {
  return safeQuery(
    "explorer-query",
    async () => {
      const search = query?.trim().slice(0, 200);

      const logs = await db.usageLog.findMany({
        where: {
          userId,
          ...(search
            ? {
                OR: [
                  { provider: { contains: search } },
                  { model: { contains: search } },
                  { projectKey: { contains: search } },
                  { agentName: { contains: search } },
                  { agentId: { contains: search } },
                  { tagsJson: { contains: search } },
                  { requestName: { contains: search } }
                ]
              }
            : {})
        },
        orderBy: { createdAt: "desc" },
        take: 1000
      });

      return logs.map(serializeLog);
    },
    []
  );
}

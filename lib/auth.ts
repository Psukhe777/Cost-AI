import { nanoid } from "nanoid";
import { db } from "@/lib/db";

export function createApiSecret() {
  return `cst_${nanoid(38)}`;
}

function fallbackLocalUser(email = "local@cost.ai") {
  return {
    id: "local-fallback",
    email,
    apiSecret: "",
    budgetUsd: 0,
    createdAt: new Date(0),
    updatedAt: new Date(0)
  };
}

/**
 * SECURITY NOTE:
 * Cost AI v2 is currently a single-user, local-first dashboard. This helper
 * upserts one default local user and is not an authentication boundary.
 *
 * Do not deploy this as a public multi-tenant service without replacing this
 * function with real session/user resolution and tenant isolation.
 */
export async function getCurrentUser() {
  const email = process.env.COSTAI_DEFAULT_USER_EMAIL ?? "local@cost.ai";
  const budgetUsd = Number(process.env.COSTAI_DEFAULT_BUDGET_USD ?? 0);

  try {
    return await db.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        budgetUsd: Number.isFinite(budgetUsd) ? budgetUsd : 0,
        apiSecret: process.env.COSTAI_TELEMETRY_SECRET || createApiSecret()
      }
    });
  } catch (error) {
    console.error("[cost-ai-v2:current-user]", error);
    return fallbackLocalUser(email);
  }
}

export async function getUserByApiSecret(apiSecret: string) {
  if (!apiSecret) return null;

  try {
    return await db.user.findUnique({
      where: { apiSecret }
    });
  } catch (error) {
    console.error("[cost-ai-v2:api-secret-lookup]", error);
    return null;
  }
}

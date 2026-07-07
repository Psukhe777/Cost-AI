import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserByApiSecret } from "@/lib/auth";
import { db } from "@/lib/db";
import { safeRate } from "@/lib/metrics";
import { estimateCostUsd } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL_TYPE_LOCAL = "LOCAL";
const MODEL_TYPE_CLOUD = "CLOUD";

const requiredText = z
  .string()
  .trim()
  .max(200)
  .transform((value) => value || "unknown");

const optionalText = z
  .string()
  .trim()
  .max(200)
  .transform((value) => value || undefined)
  .optional();

const TagsPayload = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => {
    const rawTags = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(",")
        : [];

    return Array.from(
      new Set(
        rawTags
          .map((tag) => tag.trim().slice(0, 64))
          .filter((tag) => tag.length > 0)
      )
    ).slice(0, 24);
  });

const TelemetryPayload = z
  .object({
    apiSecret: optionalText,
    api_secret: optionalText,
    provider: requiredText.default("unknown"),
    model: requiredText.default("unknown"),
    modelType: optionalText,
    model_type: optionalText,
    projectId: optionalText,
    project_id: optionalText,
    projectName: optionalText,
    project_name: optionalText,
    agentName: optionalText,
    agent_name: optionalText,
    agentId: optionalText,
    agent_id: optionalText,
    tags: TagsPayload,
    requestName: optionalText,
    request_name: optionalText,
    promptTokens: z.coerce.number().int().nonnegative().default(0),
    prompt_tokens: z.coerce.number().int().nonnegative().optional(),
    completionTokens: z.coerce.number().int().nonnegative().default(0),
    completion_tokens: z.coerce.number().int().nonnegative().optional(),
    costUsd: z.coerce.number().nonnegative().optional(),
    cost_usd: z.coerce.number().nonnegative().optional(),
    ttftMs: z.coerce.number().int().nonnegative().optional(),
    ttft_ms: z.coerce.number().int().nonnegative().optional(),
    latencyMs: z.coerce.number().int().nonnegative().optional(),
    latency_ms: z.coerce.number().int().nonnegative().optional(),
    tps: z.coerce.number().nonnegative().optional(),
    metadata: z.record(z.unknown()).optional()
  })
  .passthrough();

function bearerSecret(request: Request) {
  const header = request.headers.get("authorization");
  return header?.replace(/^Bearer\s+/i, "").trim();
}

function normalizeModelType(modelType: string | undefined) {
  return modelType?.toUpperCase() === MODEL_TYPE_LOCAL
    ? MODEL_TYPE_LOCAL
    : MODEL_TYPE_CLOUD;
}

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = TelemetryPayload.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const input = parsed.data;
  const apiSecret = input.apiSecret ?? input.api_secret ?? bearerSecret(request);
  const user = await getUserByApiSecret(apiSecret ?? "");

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const modelType = normalizeModelType(input.modelType ?? input.model_type);
  const promptTokens = input.prompt_tokens ?? input.promptTokens;
  const completionTokens = input.completion_tokens ?? input.completionTokens;
  const totalTokens = promptTokens + completionTokens;
  const latencyMs = input.latency_ms ?? input.latencyMs;
  const tps = input.tps ?? safeRate(totalTokens, latencyMs);
  const projectKey = input.project_id ?? input.projectId ?? input.projectName ?? input.project_name;
  const projectName = input.projectName ?? input.project_name ?? projectKey;
  const agentName = input.agent_name ?? input.agentName;
  const agentId = input.agent_id ?? input.agentId;
  const requestName = input.request_name ?? input.requestName;
  const tags = input.tags ?? [];
  const explicitCost = input.cost_usd ?? input.costUsd;
  const costUsd =
    modelType === MODEL_TYPE_LOCAL
      ? 0
      : explicitCost ??
        estimateCostUsd({
          model: input.model,
          promptTokens,
          completionTokens
        });

  const project = projectKey
    ? await db.project.upsert({
        where: {
          userId_key: {
            userId: user.id,
            key: projectKey
          }
        },
        update: {
          name: projectName ?? projectKey
        },
        create: {
          userId: user.id,
          key: projectKey,
          name: projectName ?? projectKey
        }
      })
    : null;

  const log = await db.usageLog.create({
    data: {
      userId: user.id,
      projectRefId: project?.id,
      projectKey,
      agentName,
      agentId,
      tagsJson: tags.length > 0 ? JSON.stringify(tags) : null,
      provider: input.provider,
      model: input.model,
      modelType,
      promptTokens,
      completionTokens,
      totalTokens,
      costUsd,
      ttftMs: input.ttft_ms ?? input.ttftMs,
      latencyMs,
      tps,
      requestName,
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null
    }
  });

  return NextResponse.json({ ok: true, id: log.id });
}

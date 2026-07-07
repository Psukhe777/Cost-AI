export type ModelPrice = {
  inputPerMillion: number;
  outputPerMillion: number;
};

const numberFromEnv = (key: string, fallback: number) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) ? value : fallback;
};

export const BASELINE_SAVINGS_MODEL =
  process.env.COSTAI_SAVINGS_BASELINE_MODEL ?? "gpt-4o";

export const MODEL_PRICING: Record<string, ModelPrice> = {
  "gpt-4o-mini": {
    inputPerMillion: numberFromEnv("COSTAI_GPT4O_MINI_INPUT_PER_1M", 0.15),
    outputPerMillion: numberFromEnv("COSTAI_GPT4O_MINI_OUTPUT_PER_1M", 0.6)
  },
  "gpt-4o": {
    inputPerMillion: numberFromEnv("COSTAI_GPT4O_INPUT_PER_1M", 5),
    outputPerMillion: numberFromEnv("COSTAI_GPT4O_OUTPUT_PER_1M", 15)
  },
  "claude-3-5-haiku": {
    inputPerMillion: numberFromEnv("COSTAI_CLAUDE_HAIKU_3_5_INPUT_PER_1M", 0.8),
    outputPerMillion: numberFromEnv("COSTAI_CLAUDE_HAIKU_3_5_OUTPUT_PER_1M", 4)
  },
  "claude-haiku-4-5": {
    inputPerMillion: numberFromEnv("COSTAI_CLAUDE_HAIKU_4_5_INPUT_PER_1M", 1),
    outputPerMillion: numberFromEnv("COSTAI_CLAUDE_HAIKU_4_5_OUTPUT_PER_1M", 5)
  },
  "claude-3-5-sonnet": {
    inputPerMillion: numberFromEnv("COSTAI_CLAUDE_INPUT_PER_1M", 3),
    outputPerMillion: numberFromEnv("COSTAI_CLAUDE_OUTPUT_PER_1M", 15)
  },
  local: {
    inputPerMillion: 0,
    outputPerMillion: 0
  }
};

export function normalizeModelName(model: string) {
  return model.trim().toLowerCase();
}

function matchesModelFamily(model: string, family: string) {
  const suffix = model.slice(family.length);
  return suffix === "" || /^-\d{4}/.test(suffix);
}

export function getModelPrice(model: string): ModelPrice {
  const normalized = normalizeModelName(model);

  if (matchesModelFamily(normalized, "gpt-4o-mini")) {
    return MODEL_PRICING["gpt-4o-mini"];
  }
  if (matchesModelFamily(normalized, "gpt-4o")) return MODEL_PRICING["gpt-4o"];
  if (matchesModelFamily(normalized, "claude-3-5-haiku")) {
    return MODEL_PRICING["claude-3-5-haiku"];
  }
  if (matchesModelFamily(normalized, "claude-haiku-4-5")) {
    return MODEL_PRICING["claude-haiku-4-5"];
  }
  if (matchesModelFamily(normalized, "claude-3-5-sonnet")) {
    return MODEL_PRICING["claude-3-5-sonnet"];
  }
  if (normalized.includes("llama") || normalized.includes("mistral")) {
    return MODEL_PRICING.local;
  }
  if (normalized.includes("claude")) return MODEL_PRICING["claude-3-5-sonnet"];

  return MODEL_PRICING[normalized] ?? MODEL_PRICING["gpt-4o"];
}

export function estimateCostUsd(args: {
  model: string;
  promptTokens: number;
  completionTokens: number;
}) {
  const price = getModelPrice(args.model);

  return (
    (args.promptTokens / 1_000_000) * price.inputPerMillion +
    (args.completionTokens / 1_000_000) * price.outputPerMillion
  );
}

export function estimateBaselineSavingsUsd(args: {
  promptTokens: number;
  completionTokens: number;
}) {
  return estimateCostUsd({
    model: BASELINE_SAVINGS_MODEL,
    promptTokens: args.promptTokens,
    completionTokens: args.completionTokens
  });
}

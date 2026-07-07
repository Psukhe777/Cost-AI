export type SerializedLog = {
  id: string;
  createdAt: string;
  provider: string;
  model: string;
  modelType: "LOCAL" | "CLOUD";
  projectId: string | null;
  agentName: string | null;
  agentId: string | null;
  tags: string[];
  requestName: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  ttftMs: number | null;
  latencyMs: number | null;
  tps: number;
};

export type TimeSeriesPoint = {
  date: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
};

export type ModelBreakdown = {
  model: string;
  modelType: "LOCAL" | "CLOUD";
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
};

export type ProjectBreakdown = {
  projectId: string;
  agentName: string;
  totalTokens: number;
  cloudSpendUsd: number;
  localTokens: number;
  savedUsd: number;
};

export type BurnRateSnapshot = {
  anomalyDetected: boolean;
  currentTokens: number;
  previousTokens: number;
  currentTokensPerMinute: number;
  previousTokensPerMinute: number;
  spikePercent: number;
};

export type SparklinePoint = {
  hour: string;
  costUsd: number;
};

export type AgentTagBreakdown = {
  key: string;
  type: "agent" | "tag";
  totalCostUsd: number;
  totalTokens: number;
  callCount: number;
  avgLatencyMs: number;
  sparkline: SparklinePoint[];
};

export type PerformanceCostPoint = {
  model: string;
  costUsd: number;
  avgLatencyMs: number;
  avgTtftMs: number;
  avgTps: number;
};

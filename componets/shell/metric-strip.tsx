import { Activity, Banknote, Gauge, Timer, WalletCards } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { budgetUsagePercent } from "@/lib/metrics";
import { compactNumber, usd } from "@/lib/money";

type Metrics = {
  usedUsd: number;
  budgetUsd: number;
  savedUsd: number;
  totalTokens: number;
  avgLatencyMs: number;
  avgTtftMs: number;
};

const metricItems = [
  {
    key: "used",
    label: "Spend",
    icon: WalletCards
  },
  {
    key: "tokens",
    label: "Tokens",
    icon: Activity
  },
  {
    key: "latency",
    label: "Latency",
    icon: Timer
  },
  {
    key: "ttft",
    label: "TTFT",
    icon: Gauge
  },
  {
    key: "saved",
    label: "Saved",
    icon: Banknote
  }
] as const;

export function MetricStrip({ metrics }: { metrics: Metrics }) {
  const budgetPercent = budgetUsagePercent(metrics.usedUsd, metrics.budgetUsd);
  const values = {
    used: usd(metrics.usedUsd),
    tokens: compactNumber(metrics.totalTokens),
    latency: `${Math.round(metrics.avgLatencyMs)} ms`,
    ttft: `${Math.round(metrics.avgTtftMs)} ms`,
    saved: usd(metrics.savedUsd)
  };

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {metricItems.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.key} className="min-h-32">
            <div className="flex items-center justify-between gap-3">
              <div className="micro-label">
                {item.label}
              </div>
              <Icon className="h-4 w-4 text-zinc-500" />
            </div>
            <div
              className={
                item.key === "saved"
                  ? "mt-3 font-mono text-2xl font-semibold tracking-tight text-primary"
                  : item.key === "latency" || item.key === "ttft"
                    ? "mt-3 font-mono text-2xl font-semibold tracking-tight text-zinc-50"
                    : "mt-3 font-mono text-2xl font-semibold tracking-tight text-zinc-50"
              }
            >
              {values[item.key]}
            </div>
            {item.key === "used" ? (
              <div className="mt-4">
                <Progress value={budgetPercent} />
                <div className="mt-2 font-mono text-xs text-zinc-500">
                  {metrics.budgetUsd > 0
                    ? `${Math.round(budgetPercent)}% of ${usd(metrics.budgetUsd)}`
                    : "Budget not set"}
                </div>
              </div>
            ) : (
              <div className="mt-4 h-2 rounded-full bg-white/10" />
            )}
          </Card>
        );
      })}
    </div>
  );
}

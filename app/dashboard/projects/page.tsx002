import { CheckCircle2, Radio, Terminal } from "lucide-react";
import { AgentTagCostTable } from "@/components/attribution/agent-tag-cost-table";
import { CostByModelChart } from "@/components/charts/cost-by-model-chart";
import { PerformanceCostMatrix } from "@/components/charts/performance-cost-matrix";
import { SavingsWidget } from "@/components/charts/savings-widget";
import { TokenUsageChart } from "@/components/charts/token-usage-chart";
import { QueryTable } from "@/components/explorer/query-table";
import { AppShell } from "@/components/shell/app-shell";
import { MetricStrip } from "@/components/shell/metric-strip";
import { BurnRateBanner } from "@/components/watchdog/burn-rate-banner";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

function firstPayloadSnippet(apiSecret: string) {
  return `from costai import CostTracker
with CostTracker(api_secret="${apiSecret}", provider="ollama", model="llama3.1:8b", model_type="LOCAL", project_id="local-llm") as tracker:
    tracker.record_tokens(prompt_tokens=1200, completion_tokens=340)
    tracker.record_ttft()
    print("Cost AI telemetry sent")`;
}

function WelcomeEmptyState({ apiSecret }: { apiSecret: string }) {
  const checklist = [
    "Local SQLite database initialized",
    "API secret generated",
    "Telemetry endpoint ready"
  ];

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-2 py-8">
      <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-panel backdrop-blur-xl md:p-8">
        <div className="flex flex-col gap-8">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
              <Radio className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
                Welcome to Cost AI
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-35" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                Waiting for telemetry...
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-xl border border-white/10 bg-zinc-950/35 p-4">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Setup Complete
              </div>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-zinc-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950/70">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs font-medium text-zinc-400">
                <Terminal className="h-4 w-4 text-primary" />
                Python SDK first payload
              </div>
              <pre className="overflow-x-auto p-4 text-xs leading-6 text-zinc-100">
                <code>{firstPayloadSnippet(apiSecret)}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data = await getDashboardData(user.id);
  const hasTelemetry = data.metrics.requestCount > 0;

  return (
    <AppShell user={data.user}>
      {!hasTelemetry ? (
        <WelcomeEmptyState apiSecret={user.apiSecret} />
      ) : (
        <div className="mx-auto grid max-w-[1600px] gap-4">
          <BurnRateBanner burnRate={data.burnRate} />
          <MetricStrip metrics={data.metrics} />

          <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
            <TokenUsageChart data={data.timeSeries} />
            <CostByModelChart rows={data.byModel} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <PerformanceCostMatrix data={data.performanceCost} />
            <AgentTagCostTable rows={data.byAgentTag} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
            <SavingsWidget
              savedUsd={data.metrics.savedUsd}
              localTokens={data.metrics.localTokens}
              cloudTokens={data.metrics.cloudTokens}
            />
            <QueryTable logs={data.logs} />
          </div>
        </div>
      )}
    </AppShell>
  );
}

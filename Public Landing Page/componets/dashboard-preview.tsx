import { ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react'

const models = [
  { name: 'llama3.1:8b', type: 'LOCAL', cost: '$0.00', pct: 46, color: 'bg-accent' },
  { name: 'gpt-4o-mini', type: 'CLOUD', cost: '$18.42', pct: 28, color: 'bg-primary' },
  { name: 'claude-3.5', type: 'CLOUD', cost: '$11.08', pct: 18, color: 'bg-chart-3' },
  { name: 'gemini-1.5', type: 'CLOUD', cost: '$4.90', pct: 8, color: 'bg-chart-4' },
]

const projects = [
  { name: 'agent-runner', spend: '$21.40', tokens: '1.2M' },
  { name: 'docs-rag', spend: '$8.90', tokens: '540K' },
  { name: 'local-llm', spend: '$0.00', tokens: '3.1M' },
]

const agents = [
  { tag: 'validator-bot', spend: '$9.10' },
  { tag: 'research-node', spend: '$6.30' },
  { tag: 'launch-demo', spend: '$2.05' },
]

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-black/40">
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-border bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">
            localhost:3000/dashboard
          </span>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-flex">
          <ShieldCheck className="size-3 text-accent" />
          local ledger
        </span>
      </div>

      <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-3">
        {/* Stat row */}
        <StatCard label="Total spend (30d)" value="$34.40" delta="12.4%" up />
        <StatCard label="Token volume" value="6.04M" delta="8.1%" up />
        <StatCard label="Local savings" value="$61.20" delta="est." accent />

        {/* Cost by model */}
        <div className="rounded-md border border-border bg-white/[0.02] p-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Cost by model</h4>
            <span className="font-mono text-xs text-muted-foreground">avg TTFT 420ms</span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {models.map((m) => (
              <div key={m.name} className="flex items-center gap-3">
                <div className="flex w-40 shrink-0 items-center gap-2">
                  <span className="truncate font-mono text-xs text-foreground">{m.name}</span>
                  <span
                    className={`rounded px-1 py-0.5 font-mono text-[9px] ${
                      m.type === 'LOCAL'
                        ? 'bg-accent/15 text-accent'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {m.type}
                  </span>
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-xs text-muted-foreground">
                  {m.cost}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget status */}
        <div className="rounded-md border border-border bg-white/[0.02] p-4">
          <h4 className="text-sm font-medium text-foreground">Budget status</h4>
          <div className="mt-4 space-y-3">
            <BudgetBar label="agent-runner" used={71} amount="$21.40 / $30" />
            <BudgetBar label="docs-rag" used={44} amount="$8.90 / $20" />
            <BudgetBar label="local-llm" used={0} amount="$0 / $10" ok />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-md border border-accent/20 bg-accent/10 px-2.5 py-2">
            <ShieldCheck className="size-3.5 shrink-0 text-accent" />
            <span className="text-xs text-accent">Circuit breakers armed</span>
          </div>
        </div>

        {/* Project attribution */}
        <div className="rounded-md border border-border bg-white/[0.02] p-4">
          <h4 className="text-sm font-medium text-foreground">Project attribution</h4>
          <div className="mt-3 flex flex-col divide-y divide-border">
            {projects.map((p) => (
              <div key={p.name} className="flex items-center justify-between py-2">
                <span className="font-mono text-xs text-foreground">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-muted-foreground">{p.tokens}</span>
                  <span className="font-mono text-xs text-foreground">{p.spend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent / tag attribution */}
        <div className="rounded-md border border-border bg-white/[0.02] p-4 md:col-span-2">
          <h4 className="text-sm font-medium text-foreground">Agent &amp; tag attribution</h4>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {agents.map((a) => (
              <div
                key={a.tag}
                className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2"
              >
                <span className="font-mono text-xs text-muted-foreground">#{a.tag}</span>
                <span className="font-mono text-xs text-foreground">{a.spend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  delta,
  up,
  accent,
}: {
  label: string
  value: string
  delta: string
  up?: boolean
  accent?: boolean
}) {
  return (
    <div className="rounded-md border border-border bg-white/[0.02] p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-foreground">{value}</p>
      <div
        className={`mt-1 inline-flex items-center gap-1 font-mono text-[11px] ${
          accent ? 'text-accent' : up ? 'text-muted-foreground' : 'text-muted-foreground'
        }`}
      >
        {!accent && (up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />)}
        {delta}
      </div>
    </div>
  )
}

function BudgetBar({
  label,
  used,
  amount,
  ok,
}: {
  label: string
  used: number
  amount: string
  ok?: boolean
}) {
  const danger = used >= 70
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-muted-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">{amount}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${
            ok ? 'bg-accent' : danger ? 'bg-destructive' : 'bg-primary'
          }`}
          style={{ width: `${Math.max(used, 3)}%` }}
        />
      </div>
    </div>
  )
}

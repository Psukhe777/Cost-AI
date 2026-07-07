import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Check,
  CircleSlash,
  Eye,
  FolderTree,
  Gauge,
  Network,
  Sparkles,
  Tags,
  X,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { DashboardPreview } from '@/components/dashboard-preview'
import { siteConfig } from '@/lib/site'

const proofBadges = [
  'Local-first',
  'SQLite',
  'No prompt storage',
  'Dry-run previews',
  'Budget controls',
  'Proxy mode',
]

const toolPills = [
  'Cursor',
  'Codex',
  'Claude Code',
  'Gemini CLI',
  'Ollama',
  'LM Studio',
  'LiteLLM',
  'OpenAI',
  'Anthropic',
  'Local scripts',
]

const neverStores = [
  'Prompts',
  'Completions',
  'Chat messages',
  'Source code',
  'Raw request bodies',
  'Raw response bodies',
  'Provider secrets',
  'Plaintext proxy keys',
]

const canStore = [
  'Provider',
  'Model',
  'Token counts',
  'Estimated cost',
  'Latency and TTFT',
  'Project attribution',
  'Agent attribution',
  'Tags',
  'Sanitized operational metadata',
]

const features = [
  {
    icon: BarChart3,
    title: 'Cost dashboard',
    body: 'See spend, tokens, latency, TTFT, and throughput across models and providers.',
  },
  {
    icon: FolderTree,
    title: 'Project attribution',
    body: 'Understand which projects, experiments, and local workflows drive AI usage.',
  },
  {
    icon: Tags,
    title: 'Agent and tag attribution',
    body: 'Track usage by agent, task, workflow, or custom tag.',
  },
  {
    icon: Gauge,
    title: 'Local-vs-cloud savings',
    body: 'Compare local model usage against configurable cloud pricing baselines.',
  },
  {
    icon: Eye,
    title: 'Dry-run ingestion preview',
    body: 'Preview sanitized telemetry candidates before anything is written to the local ledger.',
  },
  {
    icon: Network,
    title: 'Local proxy mode',
    body: 'Route compatible requests through localhost with wrapped keys and usage-only telemetry extraction.',
  },
  {
    icon: CircleSlash,
    title: 'Budget circuit breakers',
    body: 'Prepare per-project spend ceilings that fail closed when requests cannot be verified.',
  },
]

const founderBullets = [
  'Early access to Cost AI Desktop Preview',
  'Founder-only product updates',
  'Roadmap influence',
  'Priority feedback channel',
  'Future Cost AI Plus discount',
  'Private onboarding option',
]

const faqs = [
  {
    q: 'Is Cost AI a cloud SaaS?',
    a: 'No. Cost AI is local-first. The current product runs locally with a SQLite ledger. Sync should be opt-in and off by default.',
  },
  {
    q: 'Do you store prompts or completions?',
    a: 'No. Cost AI is designed around structural usage telemetry, not content capture.',
  },
  {
    q: 'Does it work locally?',
    a: 'Yes. The current MVP runs as a local Next.js dashboard backed by Prisma and SQLite.',
  },
  {
    q: 'Are cost numbers exact provider invoices?',
    a: 'No. Cost AI estimates spend from token counts and configurable pricing baselines.',
  },
  {
    q: 'Is sync enabled by default?',
    a: 'No. Cost AI should remain local-first by default.',
  },
  {
    q: 'Who is this for?',
    a: 'Developers, AI engineers, indie hackers, small teams, agencies, and anyone using coding agents or LLM APIs across projects.',
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-grid" />
          <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 font-mono text-xs text-muted-foreground">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                </span>
                local-first · zero cloud telemetry
              </div>

              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Private AI cost tracking for developers
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Track LLM spend, tokens, latency, and project attribution locally without storing
                prompts, completions, source code, raw request bodies, or provider secrets.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/waitlist"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                >
                  Join Waitlist
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href={siteConfig.founderPass}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted sm:w-auto"
                >
                  <Sparkles className="size-4" />
                  Get Founder Pass
                </a>
              </div>

              <p className="mt-4 font-mono text-xs text-muted-foreground">
                Local-first by default. SQLite ledger. No prompt storage.
              </p>
            </div>

            {/* Hero visual */}
            <div className="mx-auto mt-14 max-w-4xl">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* Proof strip */}
        <section className="border-y border-border bg-white/[0.02]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-5 sm:px-6">
            {proofBadges.map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 font-mono text-xs text-muted-foreground"
              >
                <Check className="size-3.5 text-accent" />
                {badge}
              </div>
            ))}
          </div>
        </section>

        {/* Problem */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              AI spend is scattered across every developer tool
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Developers now spend through Cursor, Codex, Claude Code, Gemini CLI, Ollama, LiteLLM,
              LM Studio, direct provider APIs, automation scripts, and local agents. Cost visibility
              is fragmented, and invoices arrive after the behavior is already baked in.
            </p>
          </div>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
            {toolPills.map((tool) => (
              <span
                key={tool}
                className="rounded-md border border-border bg-secondary px-3 py-1.5 font-mono text-xs text-muted-foreground"
              >
                {tool}
              </span>
            ))}
          </div>
        </section>

        {/* Privacy promise */}
        <section id="privacy" className="border-t border-border bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Privacy promise
              </span>
              <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Cost intelligence without content capture
              </h2>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-destructive/20 bg-destructive/[0.06] p-6">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md bg-destructive/15">
                    <X className="size-3.5 text-destructive" />
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">Cost AI never stores</h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {neverStores.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <X className="size-3.5 shrink-0 text-destructive/80" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-accent/20 bg-accent/[0.06] p-6">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md bg-accent/15">
                    <Check className="size-3.5 text-accent" />
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">Cost AI can store</h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {canStore.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <Check className="size-3.5 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Features
            </span>
            <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Built for local-first AI workflows
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex size-9 items-center justify-center rounded-md border border-border bg-secondary">
                  <feature.icon className="size-4 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Founder offer */}
        <section className="border-t border-border bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-border bg-card">
              <div className="border-b border-border bg-white/[0.02] p-8 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                  <Sparkles className="size-3.5" />
                  Founder Pass
                </span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  Cost AI Plus Founder Pass
                </h2>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="font-mono text-5xl font-semibold text-foreground">$99</span>
                  <span className="text-sm text-muted-foreground">one-time</span>
                </div>
                <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                  For early developers and small teams who want private AI cost control before
                  surprise AI bills become a habit.
                </p>
              </div>

              <div className="p-8">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {founderBullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={siteConfig.founderPass}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Get Founder Pass
                    <ArrowRight className="size-4" />
                  </a>
                  <Link
                    href="/waitlist"
                    className="inline-flex flex-1 items-center justify-center rounded-md border border-border bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted"
                  >
                    Join Waitlist Instead
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              FAQ
            </span>
            <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Questions, answered
            </h2>
          </div>

          <div className="mt-10 divide-y divide-border rounded-lg border border-border bg-card">
            {faqs.map((faq) => (
              <details key={faq.q} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground">
                  {faq.q}
                  <span className="flex size-5 shrink-0 items-center justify-center rounded border border-border text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

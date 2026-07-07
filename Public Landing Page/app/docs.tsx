import type { Metadata } from 'next'
import { AlertTriangle } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CodeBlock } from '@/components/code-block'

export const metadata: Metadata = {
  title: 'Docs — Cost AI',
  description:
    'Documentation for Cost AI: quick start, local telemetry API, Python SDK, privacy model, desktop preview, proxy mode, and quality gates.',
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'telemetry-api', label: 'Local telemetry API' },
  { id: 'python-sdk', label: 'Python SDK example' },
  { id: 'privacy-model', label: 'Privacy model' },
  { id: 'desktop-preview', label: 'Desktop preview' },
  { id: 'proxy-mode', label: 'Proxy mode' },
  { id: 'quality-gates', label: 'Quality gates' },
]

const pythonExample = `from costai import CostTracker

with CostTracker(
    api_secret="YOUR_LOCAL_API_SECRET",
    provider="ollama",
    model="llama3.1:8b",
    model_type="LOCAL",
    project_id="local-llm",
    agent_name="validator-bot",
    tags=["launch-demo"],
) as tracker:
    tracker.record_tokens(prompt_tokens=450, completion_tokens=150)
    tracker.record_ttft()
    print("Cost AI telemetry sent")`

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Documentation
              </span>
              <nav className="mt-4 flex flex-col gap-1 border-l border-border">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="-ml-px border-l border-transparent py-1.5 pl-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    {section.label}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <article className="min-w-0 max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Cost AI Docs
              </h1>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Local-first AI cost intelligence. Everything runs on your machine, backed by a
                SQLite ledger. Sync is opt-in and off by default.
              </p>

              <Section id="overview" title="Overview">
                <p>
                  Cost AI records structural usage telemetry — provider, model, token counts,
                  estimated cost, latency, and attribution — without capturing prompts, completions,
                  or source code. The current MVP runs as a local Next.js dashboard backed by Prisma
                  and SQLite.
                </p>
              </Section>

              <Section id="quick-start" title="Quick Start">
                <p>Install dependencies, run setup, and start the local dashboard.</p>
                <CodeBlock filename="terminal" code={`npm install\nnpm run setup\nnpm run dev`} />
                <p>Then open the dashboard:</p>
                <CodeBlock filename="dashboard" code="http://localhost:3000/dashboard" />
              </Section>

              <Section id="telemetry-api" title="Local telemetry API">
                <p>
                  Send sanitized usage events to the local ingestion endpoint. Only structural
                  metadata is accepted — request and response bodies are never persisted.
                </p>
                <CodeBlock
                  filename="POST /api/telemetry"
                  code={`curl -X POST http://localhost:3000/api/telemetry \\
  -H "Authorization: Bearer YOUR_LOCAL_API_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "ollama",
    "model": "llama3.1:8b",
    "model_type": "LOCAL",
    "project_id": "local-llm",
    "prompt_tokens": 450,
    "completion_tokens": 150,
    "ttft_ms": 320
  }'`}
                />
              </Section>

              <Section id="python-sdk" title="Python SDK example">
                <p>Wrap any call to attribute spend to a project, agent, and tags.</p>
                <CodeBlock filename="tracker.py" language="python" code={pythonExample} />
              </Section>

              <Section id="privacy-model" title="Privacy model">
                <p>
                  Cost AI is designed around content-free telemetry. It never stores prompts,
                  completions, chat messages, source code, raw request or response bodies, provider
                  secrets, or plaintext proxy keys. It can store provider, model, token counts,
                  estimated cost, latency and TTFT, attribution, tags, and sanitized operational
                  metadata.
                </p>
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/[0.06] p-4">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Do not expose the local dashboard or API directly to the public internet without
                    replacing the local auth model, adding durable rate limits, and reviewing tenant
                    isolation.
                  </p>
                </div>
              </Section>

              <Section id="desktop-preview" title="Desktop preview">
                <p>
                  The Cost AI Desktop Preview packages the local dashboard and ledger into a native
                  shell for always-on tracking. Founder Pass holders get early access as it ships.
                </p>
              </Section>

              <Section id="proxy-mode" title="Proxy mode">
                <p>
                  Route compatible requests through localhost with wrapped keys. Cost AI extracts
                  usage-only telemetry from responses and forwards traffic untouched — bodies are
                  never written to the ledger.
                </p>
                <CodeBlock
                  filename="proxy config"
                  code={`export OPENAI_BASE_URL="http://localhost:3000/proxy/openai"\nexport COSTAI_API_SECRET="YOUR_LOCAL_API_SECRET"`}
                />
              </Section>

              <Section id="quality-gates" title="Quality gates">
                <p>
                  Use the dry-run ingestion preview to inspect sanitized telemetry candidates before
                  anything is committed. Budget circuit breakers enforce per-project spend ceilings
                  and fail closed when a request cannot be verified.
                </p>
                <CodeBlock filename="terminal" code={`npm run ingest -- --dry-run`} />
              </Section>
            </article>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground [&_p]:text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

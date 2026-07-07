# Cost AI

**Local-first AI cost intelligence for developers, agents, and small teams.**

Cost AI helps you track LLM spend, token usage, latency, time-to-first-token, project attribution, agent attribution, model usage, and local-vs-cloud savings from your own machine.

The core promise is simple:

> Know what your AI tools cost without storing prompts, completions, source code, raw request bodies, or provider secrets.

Cost AI currently ships as a Next.js App Router dashboard backed by Prisma and SQLite, with a Python SDK, local telemetry API, dry-run ingestion preview foundation, and an OpenAI-compatible local proxy slice for wrapped keys and budget enforcement.

## Why Cost AI

AI usage is no longer happening in one clean place.

Developers now spend through coding agents, IDEs, CLIs, local model tools, provider APIs, automation scripts, and internal prototypes. The bill arrives later, but the behavior happens locally, across projects and tools.

Cost AI gives you a private cost intelligence loop:

- See which providers, models, projects, agents, and tags drive spend.
- Compare cloud usage against local model savings.
- Track latency, TTFT, throughput, and token volume.
- Preview local telemetry before persistence.
- Prepare local budget enforcement through a localhost proxy.
- Keep sensitive work out of the database.

## What Works Today

Cost AI is currently a launch-ready local developer MVP.

- **Local dashboard** for spend, tokens, latency, TTFT, TPS, model usage, project attribution, agent attribution, tags, and savings.
- **SQLite ledger** through Prisma, stored locally by default.
- **Python SDK** for recording usage from local scripts and agents.
- **Authenticated telemetry API** at `POST /api/telemetry`.
- **Metadata sanitizer** that strips prompt, completion, message, content, code, source, raw body, and secret-like fields before persistence.
- **Empty-state onboarding** when no telemetry exists.
- **Deterministic demo seed** for recording product demos.
- **Desktop control surface** at `/dashboard/desktop`.
- **Dry-run ingestion preview API** for `.codex`, Claude Code, Cursor, Gemini CLI, LiteLLM, Ollama, and LM Studio source adapters.
- **Opt-in persistence flags** for local ingestion sources, defaulted off.
- **Wrapped local proxy keys** with hashed storage and one-time plaintext display.
- **OpenAI-compatible proxy route foundation** with Zod validation, provider forwarding contracts, usage-only telemetry extraction, and budget block events.
- **Budget checks** designed to fail closed when project attribution or budget state cannot be verified.

## What Cost AI Never Stores

Cost AI is designed around structural usage telemetry, not content capture.

| Never stored | Stored when available |
| --- | --- |
| Prompts | Provider |
| Completions | Model |
| Chat messages | Token counts |
| Source code | Estimated cost |
| Raw request bodies | Latency and TTFT |
| Raw response bodies | Project and agent attribution |
| Plaintext provider secrets | Tags |
| Plaintext wrapped proxy keys | Sanitized operational metadata |

The sanitizer recursively strips content-like and secret-like fields before metadata is written to SQLite.

## Product Preview

Cost AI gives you a dense local dashboard for understanding AI usage across cloud and local model workflows.

```text
Cost AI Dashboard
|-- Spend, tokens, latency, TTFT, and TPS
|-- Cost by model and provider
|-- Project-level usage
|-- Agent and tag attribution
|-- Local-vs-cloud savings
|-- Recent telemetry explorer
`-- Desktop preview: ingestion sources, dry-run candidates, proxy keys, budget status
```

## Architecture

```text
[Local Agent / Script / App]
        |
        | structural telemetry only
        v
[localhost:3000/api/telemetry]
        |
        | auth, validation, rate limit, sanitizer
        v
[Prisma + SQLite Ledger]
        |
        v
[Cost AI Dashboard]
```

Desktop-ready direction:

```text
[Cost AI Desktop]
        |
        |-- Embedded dashboard
        |-- Local telemetry API
        |-- Local ingestion daemon
        |-- Dry-run preview queue
        |-- Local proxy gateway
        |-- SQLite ledger
        |-- Budget circuit breakers
        |-- Opt-in sync/export layer
```

Native desktop packaging is the next product boundary. The current repo exposes the daemon, preview, proxy, and budget contracts inside the existing local Next.js application first.

## Tech Stack

| Layer | Technology |
| --- | --- |
| App framework | Next.js App Router |
| Language | TypeScript |
| Database | SQLite |
| ORM | Prisma |
| UI | React, Tailwind CSS, local UI primitives |
| Charts | Recharts |
| Validation | Zod |
| SDK | Python |
| Runtime target | Localhost today, native desktop next |

## Quick Start

### Requirements

- Node.js `20.x` or newer
- npm `10.x` or newer
- Python `3.11` or newer for the SDK
- SQLite support through Prisma

On Windows, prefer `npm.cmd` because PowerShell execution policy can block `npm.ps1`.

### 1. Install dependencies

```bash
npm install
```

### 2. Initialize local state

```bash
npm run setup
```

This creates `.env.local` when needed, generates the Prisma client, applies the SQLite schema, and creates the default local user/API secret.

Expected output:

```text
[SUCCESS] Cost AI initialized. Run 'npm run dev' to start the dashboard.
```

### 3. Start the dashboard

```bash
npm run dev
```

Open:

[http://localhost:3000/dashboard](http://localhost:3000/dashboard)

### 4. Optional: seed demo data

Use deterministic demo telemetry when recording a walkthrough or testing the dashboard without real usage.

```bash
npm run demo:seed
```

Verify the seed and desktop smoke checks:

```bash
npm run test
```

## Send Your First Telemetry Event

Install the local Python SDK in editable mode:

```bash
python -m pip install -e sdk
```

Use the local API secret shown in the onboarding screen or stored in `.env.local`.

```python
from costai import CostTracker

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
    print("Cost AI telemetry sent")
```

Refresh the dashboard to see the row, metrics, charts, and attribution update.

## Direct HTTP Telemetry

You can also post structural telemetry directly to the local API.

```python
import requests

url = "http://127.0.0.1:3000/api/telemetry"
api_secret = "YOUR_LOCAL_API_SECRET"

payload = {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "model_type": "CLOUD",
    "project_id": "support-copilot",
    "agent_name": "router",
    "request_name": "agent.step",
    "prompt_tokens": 450,
    "completion_tokens": 150,
    "latency_ms": 1250,
    "ttft_ms": 250,
    "tags": ["local-test"],
    "metadata": {
        "runId": "launch-demo-001",
        "environment": "local",
        "toolName": "manual-http-post"
    }
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_secret}",
}

response = requests.post(url, json=payload, headers=headers, timeout=3)
print(response.status_code)
print(response.json())
```

## Desktop Preview

The desktop-ready surface is available at:

[http://localhost:3000/dashboard/desktop](http://localhost:3000/dashboard/desktop)

It includes:

- Local daemon/source status.
- Ingestion adapters for `.codex`, Claude Code, Cursor, Gemini CLI, LiteLLM, Ollama, and LM Studio.
- Dry-run preview rows for sanitized telemetry candidates.
- Per-source persistence toggles, off by default.
- Proxy key status.
- Provider readiness.
- Budget circuit breaker status.

Every ingestion path is designed to preview before persistence. Sync is not enabled by default.

## Local Proxy Mode

Cost AI includes the first local proxy foundation:

- `POST /api/proxy/keys` issues wrapped local proxy keys.
- SQLite stores only key hashes and short prefixes.
- `GET /api/proxy/status` reports proxy readiness, active keys, provider environment references, budgets, and recent blocks.
- `POST /api/proxy/v1/chat/completions` accepts OpenAI-style localhost proxy calls.

Provider secrets are expected to remain local environment references such as:

```text
OPENAI_API_KEY=""
COSTAI_PROXY_OPENAI_COMPATIBLE_BASE_URL=""
COSTAI_PROXY_OPENAI_COMPATIBLE_API_KEY=""
```

Cost AI does not store plaintext provider keys or plaintext wrapped proxy keys.

## Commands

```bash
npm run setup
npm run dev
npm run demo:seed
npm run type-check
npm run lint
npm run test
npm run build
```

Windows equivalents:

```powershell
npm.cmd run setup
npm.cmd run dev
npm.cmd run demo:seed
npm.cmd run type-check
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

## Quality Gates

Before release, run:

```powershell
npm.cmd run type-check
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

The current test command runs:

- Desktop smoke checks.
- Sanitizer privacy regression checks.
- Source adapter tolerance checks.
- Wrapped key hashing checks.
- Budget fail-closed checks.
- Demo aggregate verification.

If demo verification fails because local demo state is stale, reseed:

```powershell
npm.cmd run demo:seed
npm.cmd run test
```

## Environment

The default local environment is documented in `.env.example`.

```text
DATABASE_URL="file:./dev.db"
COSTAI_DEFAULT_USER_EMAIL="local@cost.ai"
COSTAI_DEFAULT_BUDGET_USD="0"
COSTAI_TELEMETRY_SECRET=""
```

Pricing baselines can be adjusted with environment variables. They are estimates, not live provider billing records.

## API Surface

| Route | Purpose |
| --- | --- |
| `POST /api/telemetry` | Record sanitized structural LLM telemetry |
| `GET /api/me` | Return local user/app bootstrap state |
| `GET /api/ingestion/sources` | List supported local ingestion sources |
| `POST /api/ingestion/preview` | Run dry-run ingestion preview |
| `POST /api/ingestion/sources/:id/enable` | Explicitly enable or disable source persistence |
| `POST /api/proxy/keys` | Issue a wrapped local proxy key |
| `GET /api/proxy/status` | Inspect provider, key, and budget readiness |
| `POST /api/proxy/v1/chat/completions` | OpenAI-compatible local proxy endpoint |

All external or local IPC/API boundaries use validation and are designed around prompt-safe telemetry.

## Project Structure

```text
app/                  Next.js App Router pages and API routes
components/           Dashboard shell, charts, tables, and UI primitives
lib/                  Auth, DB, pricing, metrics, privacy, ingestion, proxy, queries
lib/ingestion/        Source registry, sanitizer bridge, scanner, source adapters
lib/proxy/            Wrapped keys, provider contracts, telemetry extraction, budgets
prisma/               SQLite schema
scripts/              Setup, demo seed, workspace validation, smoke tests
sdk/costai/           Python context manager/decorator tracker
```

## Privacy And Security Notes

- Cost AI is local-first by default.
- Telemetry is stored in local SQLite, not sent to a remote service.
- `.env.local` and SQLite database files should never be committed.
- `/api/telemetry` requires the local API secret.
- Metadata is sanitized recursively before storage.
- Metadata depth and size are bounded.
- Request bodies are size-limited.
- Local rate limiting is process-local.
- Proxy budget checks are designed to fail closed.
- This MVP is not a hosted multi-tenant SaaS.

Do not expose the local dashboard or API directly to the public internet without replacing the local auth model, adding durable rate limits, and reviewing tenant isolation.

## Roadmap

Near-term product direction:

- Native Windows desktop packaging.
- System tray and explicit start-on-login controls.
- Local ingestion daemon lifecycle.
- Rich dry-run preview review and approval flow.
- Stronger proxy provider support.
- Per-project budget ceilings and alerts.
- Export workflow.
- Opt-in sync only after the local persistence path is trusted.

## Status

Cost AI is ready for local MVP demos and early developer feedback.

It is not yet a hosted SaaS, not a multi-tenant observability platform, and not a finished native desktop binary. The product direction is a secure local desktop application with optional sync later.

## License

MIT License. See [LICENSE](./LICENSE).

---

Built by Nehemiah Sturdivant at Babylon Technologies LLC.

Built with focus by Nehemiah Sturdivant at Babylon Technologies LLC.


# Cost AI 📊

Local-first LLM cost intelligence for developers, agents, and small teams.

Cost AI gives you a private telemetry node for tracking LLM spend, token usage, latency, TTFT, project attribution, agent attribution, model usage, and local-vs-cloud savings without sending prompts or completions to a third-party observability platform.

## 📸 Visual Overview

Real-time, local-first analytics for fractional spend, token counts, model performance, and agent-level attribution.

Cost AI is built for developers running local and cloud LLM workloads who want fast cost visibility without handing sensitive model context to a hosted analytics vendor.

## Why Cost AI?

Traditional LLM observability platforms can introduce painful trade-offs:

**Data Leakage**  
Many tools ask you to ship prompts, completions, messages, code, and orchestration logs to a third-party cloud just to calculate token costs.

**Configuration Complexity**  
Enterprise monitoring stacks often require Docker orchestration, external credentials, hosted databases, message queues, and environment-specific mapping.

**Slow Local Feedback**  
When you are building agents locally, you need immediate feedback on token cost, latency, TTFT, and model behavior without waiting on hosted infrastructure.

Cost AI fixes this by acting as an isolated loopback telemetry receiver on your machine. It stores structural usage metadata in local SQLite, requires no cloud configuration, and sanitizes prompt/content-like metadata before persistence.

Your prompts, your code, your model data, and your local workflow stay yours.

## ⚡ Key Features

- **Sub-Cent Cost Tracking**  
  Estimate fractional LLM spend across cloud and local model workflows.

- **Agent And Project Attribution**  
  Map usage to projects, task runners, tools, sub-agents, and tags instead of grouping everything under a single API key.

- **Local-Vs-Cloud Savings**  
  Compare local model usage against a configurable cloud baseline to estimate avoided spend.

- **Performance Matrix Analytics**  
  Track Time-to-First-Token, latency, and tokens-per-second across providers and models.

- **Private Metadata Sanitization**  
  Strip prompt, completion, message, content, input, output, code, source, text, raw, and body-like fields before storage.

- **Local Telemetry Hardening**  
  Enforce API-secret authentication, request body limits, metadata size/depth limits, and simple local rate limiting.

- **Zero-Cloud Local Storage**  
  Store telemetry in a relative SQLite database on your machine.

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js App Router |
| Database | SQLite |
| ORM / Client | Prisma Client |
| Styling | Tailwind CSS |
| Charts | Recharts |
| UI Primitives | Radix-style local components |
| SDK | Python |

## 🚀 Quick Start

Follow these steps to stand up your local telemetry node and stream data in under a minute.

### 1. Clone And Install

```bash
git clone https://github.com/your-username/cost-ai.git
cd cost-ai
npm install
```

### 2. Initialize Cost AI

This creates `.env.local`, generates the Prisma client, initializes the local SQLite schema, and creates your local API secret.

```bash
npm run setup
```

Expected output:

```txt
[SUCCESS] Cost AI initialized. Run 'npm run dev' to start the dashboard.
```

Default local database:

```txt
DATABASE_URL="file:./dev.db"
```

### 3. Launch The Dashboard

```bash
npm run dev
```

Open:

[http://localhost:3000/dashboard](http://localhost:3000/dashboard)

If no telemetry exists yet, Cost AI shows a clean onboarding state with your local API secret and a first-payload Python snippet.

### 4. Stream Your First Telemetry Payload

Install the local Python SDK:

```bash
python -m pip install -e sdk
```

Use the API secret displayed on the onboarding screen:

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

Refresh the dashboard to see the telemetry row, metrics, and charts come alive.

## 📡 Direct HTTP Telemetry

You can also post directly to the local HTTP endpoint.

```python
import requests

url = "http://127.0.0.1:3000/api/telemetry"
api_secret = "YOUR_LOCAL_API_SECRET"

payload = {
    "provider": "openai",
    "model": "gpt-4o",
    "model_type": "CLOUD",
    "project_id": "production-swarm",
    "agent_name": "validator-bot",
    "prompt_tokens": 450,
    "completion_tokens": 150,
    "latency_ms": 1250,
    "ttft_ms": 250,
    "tags": ["launch-demo"],
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

## 🧪 Demo Data

Populate the dashboard with deterministic local and cloud demo telemetry:

```bash
npm run demo:seed
```

Validate seeded data and core aggregate queries:

```bash
npm run test
```

Demo seeding is optional. A fresh user can skip demo data entirely and stream only real local telemetry.

## 🔐 Core Architecture And Privacy

Cost AI is designed around structural telemetry, not prompt capture.

```txt
[ Your Local Agent / Script / App ]
              |
              |  Structural usage only
              |  tokens, model, provider, latency, TTFT, project, agent, tags
              v
[ http://localhost:3000/api/telemetry ]
              |
              |  sanitizes metadata
              |  rejects oversized payloads
              v
[ Cost AI Dashboard + Local SQLite ]
```

The telemetry route rejects or strips content-like metadata before storage, including:

```txt
prompt, prompts, completion, completions, message, messages,
content, contents, input, inputs, output, outputs,
code, source, text, raw, body
```

Because Cost AI stores only numeric usage signals, model identifiers, project/agent attribution, tags, and safe operational metadata, your underlying prompt and completion content stays out of the database.

## 💼 Team And Enterprise Scaling

Cost AI currently launches as a local-first developer MVP.

Future hosted/team infrastructure can add:

- Centralized metric routing
- Persistent multi-user authorization
- Hosted team dashboards
- Durable rate limits
- Managed database storage
- Organization-level reporting

👉 [Join the Cloud Waitlist](https://your-landing-page.com)

## 🛡️ License

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.

---

Built with focus by Nehemiah Sturdivant at Babylon Technologies LLC.


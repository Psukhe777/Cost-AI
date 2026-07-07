import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { nanoid } from "nanoid";

const envPath = ".env.local";
const defaultDatabaseUrl = "file:./costai.db";
const defaultEmail = "local@cost.ai";
const defaultBudgetUsd = "0";

function readEnvValue(contents: string, key: string) {
  const match = contents.match(new RegExp(`^${key}=["']?([^"'\n]+)["']?$`, "m"));
  return match?.[1];
}

function ensureLocalEnv() {
  if (existsSync(envPath)) {
    const contents = readFileSync(envPath, "utf8");
    process.env.DATABASE_URL ||= readEnvValue(contents, "DATABASE_URL") ?? defaultDatabaseUrl;
    process.env.COSTAI_TELEMETRY_SECRET ||= readEnvValue(
      contents,
      "COSTAI_TELEMETRY_SECRET"
    );
    process.env.COSTAI_DEFAULT_USER_EMAIL ||= readEnvValue(
      contents,
      "COSTAI_DEFAULT_USER_EMAIL"
    ) ?? defaultEmail;
    process.env.COSTAI_DEFAULT_BUDGET_USD ||= readEnvValue(
      contents,
      "COSTAI_DEFAULT_BUDGET_USD"
    ) ?? defaultBudgetUsd;
    return;
  }

  const telemetrySecret = `cst_${nanoid(38)}`;
  const contents = [
    `DATABASE_URL="${defaultDatabaseUrl}"`,
    `COSTAI_DEFAULT_USER_EMAIL="${defaultEmail}"`,
    `COSTAI_DEFAULT_BUDGET_USD="${defaultBudgetUsd}"`,
    `COSTAI_TELEMETRY_SECRET="${telemetrySecret}"`,
    'COSTAI_GPT4O_INPUT_PER_1M="5"',
    'COSTAI_GPT4O_OUTPUT_PER_1M="15"',
    'COSTAI_GPT4O_MINI_INPUT_PER_1M="0.15"',
    'COSTAI_GPT4O_MINI_OUTPUT_PER_1M="0.6"',
    'COSTAI_CLAUDE_HAIKU_3_5_INPUT_PER_1M="0.8"',
    'COSTAI_CLAUDE_HAIKU_3_5_OUTPUT_PER_1M="4"',
    'COSTAI_CLAUDE_HAIKU_4_5_INPUT_PER_1M="1"',
    'COSTAI_CLAUDE_HAIKU_4_5_OUTPUT_PER_1M="5"',
    'COSTAI_SAVINGS_BASELINE_MODEL="gpt-4o"'
  ].join("\n");

  writeFileSync(envPath, `${contents}\n`);
  process.env.DATABASE_URL = defaultDatabaseUrl;
  process.env.COSTAI_DEFAULT_USER_EMAIL = defaultEmail;
  process.env.COSTAI_DEFAULT_BUDGET_USD = defaultBudgetUsd;
  process.env.COSTAI_TELEMETRY_SECRET = telemetrySecret;
}

async function ensureSqliteSchema(prisma: {
  $executeRawUnsafe: (query: string) => Promise<unknown>;
}) {
  const statements = [
    `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "api_secret" TEXT NOT NULL,
        "budget_usd" DECIMAL NOT NULL DEFAULT 0.00,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL
      )
    `,
    `
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "projects_user_id_fkey"
          FOREIGN KEY ("user_id") REFERENCES "users" ("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `,
    `
      CREATE TABLE IF NOT EXISTS "usage_logs" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "project_ref_id" TEXT,
        "project_id" TEXT,
        "agent_name" TEXT,
        "agent_id" TEXT,
        "tags_json" TEXT,
        "provider" TEXT NOT NULL,
        "model" TEXT NOT NULL,
        "model_type" TEXT NOT NULL DEFAULT 'CLOUD',
        "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
        "completion_tokens" INTEGER NOT NULL DEFAULT 0,
        "total_tokens" INTEGER NOT NULL DEFAULT 0,
        "cost_usd" DECIMAL NOT NULL DEFAULT 0.00,
        "ttft_ms" INTEGER,
        "latency_ms" INTEGER,
        "tps" REAL,
        "request_name" TEXT,
        "metadata_json" TEXT,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "usage_logs_user_id_fkey"
          FOREIGN KEY ("user_id") REFERENCES "users" ("id")
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "usage_logs_project_ref_id_fkey"
          FOREIGN KEY ("project_ref_id") REFERENCES "projects" ("id")
          ON DELETE SET NULL ON UPDATE CASCADE
      )
    `,
    `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "users_api_secret_key" ON "users"("api_secret")`,
    `CREATE INDEX IF NOT EXISTS "projects_user_id_idx" ON "projects"("user_id")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "projects_user_id_key_key" ON "projects"("user_id", "key")`,
    `CREATE INDEX IF NOT EXISTS "usage_logs_user_id_created_at_idx" ON "usage_logs"("user_id", "created_at")`,
    `CREATE INDEX IF NOT EXISTS "usage_logs_user_id_model_idx" ON "usage_logs"("user_id", "model")`,
    `CREATE INDEX IF NOT EXISTS "usage_logs_user_id_provider_idx" ON "usage_logs"("user_id", "provider")`,
    `CREATE INDEX IF NOT EXISTS "usage_logs_user_id_agent_name_idx" ON "usage_logs"("user_id", "agent_name")`,
    `CREATE INDEX IF NOT EXISTS "usage_logs_user_id_agent_id_idx" ON "usage_logs"("user_id", "agent_id")`,
    `CREATE INDEX IF NOT EXISTS "usage_logs_user_id_project_id_idx" ON "usage_logs"("user_id", "project_id")`,
    `CREATE INDEX IF NOT EXISTS "usage_logs_project_ref_id_idx" ON "usage_logs"("project_ref_id")`
  ];

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
}

async function ensureUsageLogColumn(
  prisma: {
    $executeRawUnsafe: (query: string) => Promise<unknown>;
    $queryRawUnsafe: <T = unknown>(query: string) => Promise<T>;
  },
  columnName: string,
  definition: string
) {
  const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `PRAGMA table_info("usage_logs");`
  );
  const columns = new Set(rows.map((row) => row.name));

  if (!columns.has(columnName)) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "usage_logs" ADD COLUMN ${definition};`);
  }
}

async function ensureSqliteCompatibilityColumns(prisma: {
  $executeRawUnsafe: (query: string) => Promise<unknown>;
  $queryRawUnsafe: <T = unknown>(query: string) => Promise<T>;
}) {
  await ensureUsageLogColumn(prisma, "agent_id", `"agent_id" TEXT`);
  await ensureUsageLogColumn(prisma, "tags_json", `"tags_json" TEXT`);
}

async function optimizeSqliteConnection(prisma: {
  $queryRawUnsafe: (query: string) => Promise<unknown>;
}) {
  await prisma.$queryRawUnsafe("PRAGMA journal_mode=WAL;");
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout=5000;");
}

async function main() {
  ensureLocalEnv();

  const env = {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL
  };

  execSync("npx prisma generate", { stdio: "inherit", env });

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await optimizeSqliteConnection(prisma);
  await ensureSqliteSchema(prisma);
  await ensureSqliteCompatibilityColumns(prisma);

  const email = process.env.COSTAI_DEFAULT_USER_EMAIL ?? defaultEmail;
  const budgetUsd = Number(process.env.COSTAI_DEFAULT_BUDGET_USD ?? 0);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      budgetUsd: Number.isFinite(budgetUsd) ? budgetUsd : 0,
      apiSecret: process.env.COSTAI_TELEMETRY_SECRET || `cst_${nanoid(38)}`
    }
  });

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

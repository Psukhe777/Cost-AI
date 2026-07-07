import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const envExamplePath = join(root, ".env.example");
const schemaPath = join(root, "prisma", "schema.prisma");

function parseEnv(source) {
  const values = {};

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    values[key] = rawValue.trim().replace(/^"(.*)"$/, "$1");
  }

  return values;
}

function stringifyEnv(values, originalSource = "") {
  const seen = new Set();
  const lines = originalSource.split(/\r?\n/).map((line) => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);

    if (!match) return line;

    const key = match[1];
    seen.add(key);

    return `${key}="${values[key] ?? ""}"`;
  });

  for (const [key, value] of Object.entries(values)) {
    if (!seen.has(key)) lines.push(`${key}="${value}"`);
  }

  return `${lines.join("\n").trim()}\n`;
}

function createSecret() {
  return `cst_${randomBytes(29).toString("base64url")}`;
}

function runPrisma(args, env, options = {}) {
  const prismaCli = join(root, "node_modules", "prisma", "build", "index.js");
  const result = spawnSync(process.execPath, [prismaCli, ...args], {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.status !== 0) {
    if (options.allowFailure) {
      return false;
    }

    process.stdout.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    process.exit(result.status ?? 1);
  }

  return true;
}

function sqlitePathFromUrl(databaseUrl) {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error("Cost AI local setup only supports SQLite file: DATABASE_URL values.");
  }

  const rawPath = databaseUrl.slice("file:".length);
  const normalizedPath = rawPath.startsWith("//") ? rawPath.slice(2) : rawPath;

  return isAbsolute(normalizedPath)
    ? normalizedPath
    : resolve(root, "prisma", normalizedPath);
}

function findSqlite() {
  for (const command of ["sqlite3", "sqlite3.exe"]) {
    const result = spawnSync(command, ["--version"], {
      cwd: root,
      encoding: "utf8",
      stdio: "pipe"
    });

    if (result.status === 0) return command;
  }

  return null;
}

function runSqlite(databasePath, sql) {
  const sqlite = findSqlite();

  if (!sqlite) {
    throw new Error("sqlite3 is required to initialize the local Cost AI database.");
  }

  const result = spawnSync(sqlite, [databasePath], {
    cwd: root,
    input: sql,
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.status !== 0) {
    process.stdout.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    process.exit(result.status ?? 1);
  }
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function initializeSqliteSchema(databaseUrl) {
  const databasePath = sqlitePathFromUrl(databaseUrl);

  runSqlite(
    databasePath,
    `
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "api_secret" TEXT NOT NULL,
  "budget_usd" DECIMAL NOT NULL DEFAULT 0.00,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "projects" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
  CONSTRAINT "usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "usage_logs_project_ref_id_fkey" FOREIGN KEY ("project_ref_id") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_api_secret_key" ON "users" ("api_secret");
CREATE UNIQUE INDEX IF NOT EXISTS "projects_user_id_key_key" ON "projects" ("user_id", "key");
CREATE INDEX IF NOT EXISTS "projects_user_id_idx" ON "projects" ("user_id");
CREATE INDEX IF NOT EXISTS "usage_logs_user_id_created_at_idx" ON "usage_logs" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "usage_logs_user_id_model_idx" ON "usage_logs" ("user_id", "model");
CREATE INDEX IF NOT EXISTS "usage_logs_user_id_provider_idx" ON "usage_logs" ("user_id", "provider");
CREATE INDEX IF NOT EXISTS "usage_logs_user_id_agent_name_idx" ON "usage_logs" ("user_id", "agent_name");
CREATE INDEX IF NOT EXISTS "usage_logs_user_id_agent_id_idx" ON "usage_logs" ("user_id", "agent_id");
CREATE INDEX IF NOT EXISTS "usage_logs_user_id_project_id_idx" ON "usage_logs" ("user_id", "project_id");
CREATE INDEX IF NOT EXISTS "usage_logs_project_ref_id_idx" ON "usage_logs" ("project_ref_id");
`
  );
}

function upsertSqliteUser(env) {
  const databasePath = sqlitePathFromUrl(env.DATABASE_URL);
  const budgetUsd = Number(env.COSTAI_DEFAULT_BUDGET_USD ?? 0);

  runSqlite(
    databasePath,
    `
INSERT INTO "users" ("id", "email", "api_secret", "budget_usd", "created_at", "updated_at")
VALUES (
  'local-user',
  ${sqlString(env.COSTAI_DEFAULT_USER_EMAIL)},
  ${sqlString(env.COSTAI_TELEMETRY_SECRET)},
  ${Number.isFinite(budgetUsd) ? budgetUsd : 0},
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT("email") DO UPDATE SET
  "budget_usd" = excluded."budget_usd",
  "updated_at" = CURRENT_TIMESTAMP;
`
  );
}

if (!existsSync(envPath)) {
  const defaultEnv = existsSync(envExamplePath)
    ? readFileSync(envExamplePath, "utf8")
    : 'DATABASE_URL="file:./dev.db"\nCOSTAI_DEFAULT_USER_EMAIL="local@cost.ai"\nCOSTAI_DEFAULT_BUDGET_USD="0"\nCOSTAI_TELEMETRY_SECRET=""\n';

  writeFileSync(envPath, defaultEnv);
}

const originalEnv = readFileSync(envPath, "utf8");
const envValues = {
  DATABASE_URL: "file:./dev.db",
  COSTAI_DEFAULT_USER_EMAIL: "local@cost.ai",
  COSTAI_DEFAULT_BUDGET_USD: "0",
  ...parseEnv(originalEnv)
};

if (!envValues.COSTAI_TELEMETRY_SECRET) {
  envValues.COSTAI_TELEMETRY_SECRET = createSecret();
  writeFileSync(envPath, stringifyEnv(envValues, originalEnv));
}

runPrisma(["generate", "--schema", schemaPath], envValues);

if (!runPrisma(["db", "push", "--schema", schemaPath, "--skip-generate"], envValues, { allowFailure: true })) {
  initializeSqliteSchema(envValues.DATABASE_URL);
}

const { PrismaClient } = await import("@prisma/client");
const db = new PrismaClient({
  datasources: {
    db: {
      url: envValues.DATABASE_URL
    }
  }
});

try {
  const budgetUsd = Number(envValues.COSTAI_DEFAULT_BUDGET_USD ?? 0);

  await db.user.upsert({
    where: {
      email: envValues.COSTAI_DEFAULT_USER_EMAIL
    },
    update: {
      budgetUsd: Number.isFinite(budgetUsd) ? budgetUsd : 0
    },
    create: {
      email: envValues.COSTAI_DEFAULT_USER_EMAIL,
      budgetUsd: Number.isFinite(budgetUsd) ? budgetUsd : 0,
      apiSecret: envValues.COSTAI_TELEMETRY_SECRET
    }
  });
} finally {
  await db.$disconnect();
}

upsertSqliteUser(envValues);

console.log("[SUCCESS] Cost AI initialized. Run 'npm run dev' to start the dashboard.");

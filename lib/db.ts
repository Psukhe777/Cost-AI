import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaBusyTimeoutReady?: Promise<void>;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

export const prismaBusyTimeoutReady =
  globalForPrisma.prismaBusyTimeoutReady ??
  db
    .$queryRaw`PRAGMA busy_timeout=5000;`
    .then(() => undefined)
    .catch((error: unknown) => {
      console.error("Failed to initialize SQLite busy_timeout pragma", error);
    });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaBusyTimeoutReady = prismaBusyTimeoutReady;
}

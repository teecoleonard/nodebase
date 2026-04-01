import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};

const enableQueryLogging = process.env.PRISMA_LOG_QUERIES === "true";
const slowQueryThreshold =
  Number(process.env.PRISMA_SLOW_QUERY_THRESHOLD_MS ?? "300");

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: enableQueryLogging
      ? [
          { emit: "event", level: "query" },
          { emit: "event", level: "warn" },
          { emit: "stdout", level: "error" },
        ]
      : ["error"],
  });

if (enableQueryLogging) {
  prisma.$on("query", (event) => {
    if (event.duration >= slowQueryThreshold) {
      const params =
        event.params && event.params !== "[]"
          ? ` | params: ${event.params}`
          : "";
      console.warn(
        `[Prisma][SlowQuery] ${event.duration}ms – ${event.query}${params}`,
      );
    }
  });

  prisma.$on("warn", (event) => {
    console.warn(`[Prisma][Warn] ${event.message}`);
  });
}

if (process.env.NODE_ENV !== "production") 
    globalForPrisma.prisma = prisma;

export default prisma;
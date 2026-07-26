import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

/**
 * A single PrismaClient instance per process. Re-instantiating per request
 * exhausts the connection pool; re-instantiating per module reload under
 * `tsx watch` leaks connections, hence the global-cache guard below.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProduction ? ["error", "warn"] : ["warn"],
  });

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("Database connected");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Database disconnected");
}

import { createApp } from "@/app";
import { env } from "@/config/env";
import { connectDatabase, disconnectDatabase } from "@/database/prisma";
import { connectRedis, disconnectRedis } from "@/database/redis";
import { logger } from "@/utils/logger";

async function main(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port}`, { env: env.nodeEnv });
  });

  const shutdown = (signal: string): void => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(() => {
      void Promise.all([disconnectDatabase(), disconnectRedis()]).then(() => {
        process.exit(0);
      });
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => {
    shutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    shutdown("SIGINT");
  });
}

main().catch((error: unknown) => {
  logger.error("Fatal startup error", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});

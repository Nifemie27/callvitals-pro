import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

/**
 * A lazily-connecting Redis client. Caching is a performance optimization,
 * not a correctness requirement. If Redis is unreachable, `redis.enabled`
 * is set to false and the cache layer degrades to always-miss rather than
 * taking the API down with it.
 */
export const redisClient = env.redis.enabled
  ? new Redis(env.redis.url, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => Math.min(times * 200, 2000),
      ...(env.redis.tls ? { tls: {} } : {}),
    })
  : null;

let redisAvailable = false;

export async function connectRedis(): Promise<void> {
  if (!redisClient) {
    logger.info("Redis caching disabled by configuration");
    return;
  }

  try {
    await redisClient.connect();
    redisAvailable = true;
    logger.info("Redis connected");
  } catch (error) {
    redisAvailable = false;
    logger.warn("Redis unavailable, continuing without caching", {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  redisClient.on("error", (error: Error) => {
    redisAvailable = false;
    logger.warn("Redis connection error", { message: error.message });
  });

  redisClient.on("ready", () => {
    redisAvailable = true;
  });
}

export function isRedisAvailable(): boolean {
  return redisAvailable && redisClient !== null;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient && redisAvailable) {
    await redisClient.quit();
  }
}

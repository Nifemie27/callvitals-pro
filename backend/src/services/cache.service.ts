import { redisClient, isRedisAvailable } from "@/database/redis";
import { logger } from "@/utils/logger";

/**
 * Thin cache-aside wrapper around Redis. Every method fails soft: if Redis
 * is down or disabled, reads report a miss and writes are no-ops, so a
 * caching outage degrades to "slower" rather than "down".
 */
class CacheService {
  async get<T>(key: string): Promise<T | null> {
    if (!isRedisAvailable() || !redisClient) return null;
    try {
      const raw = await redisClient.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
      logger.warn("Cache read failed", { key, message: (error as Error).message });
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!isRedisAvailable() || !redisClient) return;
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
      logger.warn("Cache write failed", { key, message: (error as Error).message });
    }
  }

  /** Deletes every key matching a prefix, used to invalidate on mutation. */
  async invalidateByPrefix(prefix: string): Promise<void> {
    if (!isRedisAvailable() || !redisClient) return;
    try {
      const stream = redisClient.scanStream({ match: `${prefix}*`, count: 100 });
      const keysToDelete: string[] = [];

      for await (const keys of stream as AsyncIterable<string[]>) {
        keysToDelete.push(...keys);
      }

      if (keysToDelete.length > 0) {
        await redisClient.del(...keysToDelete);
        logger.debug("Cache invalidated", { prefix, count: keysToDelete.length });
      }
    } catch (error) {
      logger.warn("Cache invalidation failed", {
        prefix,
        message: (error as Error).message,
      });
    }
  }

  /**
   * Cache-aside helper: return the cached value, or compute and return it.
   * The cache write happens in the background rather than being awaited,
   * so a slow round trip to Redis never adds to the response's latency;
   * `set` fails soft (see above) so there is nothing here to catch.
   */
  async wrap<T>(key: string, ttlSeconds: number, compute: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await compute();
    void this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}

export const cacheService = new CacheService();

export const CACHE_PREFIXES = {
  analytics: "cache:analytics:",
  calls: "cache:calls:",
} as const;

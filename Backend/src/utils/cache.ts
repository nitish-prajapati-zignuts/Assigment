/**
 * Hybrid Redis & In-Memory Caching Utility
 * Provides fast, distributed and fallback in-memory caching for frequently accessed hot data.
 */

import { redisConnection } from "../services/logQueue";
import { logger } from "./logger";

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 2 * 60 * 1000; // 2 minutes default

  /**
   * Set a value in cache (Redis with in-memory mirror)
   */
  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const ttl = ttlMs ?? this.defaultTTL;
    const ttlSeconds = Math.max(1, Math.floor(ttl / 1000));
    const expiresAt = Date.now() + ttl;

    this.store.set(key, {
      value,
      expiresAt,
    });

    logger.debug("Cache SET", { key, ttlMs: ttl });

    try {
      if (redisConnection && redisConnection.status === "ready") {
        await redisConnection.set(key, JSON.stringify(value), "EX", ttlSeconds);
      }
    } catch (err) {
      logger.debug("Redis cache SET fallback to memory", { key });
    }

    // Schedule in-memory cleanup
    setTimeout(() => {
      this.delete(key).catch(() => {});
    }, ttl);
  }

  /**
   * Get a value from cache (Memory first, then Redis)
   */
  async get<T>(key: string): Promise<T | null> {
    // 1. Check in-memory store
    const entry = this.store.get(key);
    if (entry) {
      if (Date.now() <= entry.expiresAt) {
        logger.debug("Cache HIT (memory)", { key });
        return entry.value as T;
      }
      this.store.delete(key);
    }

    // 2. Check Redis
    try {
      if (redisConnection && redisConnection.status === "ready") {
        const raw = await redisConnection.get(key);
        if (raw) {
          logger.debug("Cache HIT (redis)", { key });
          const parsed = JSON.parse(raw) as T;
          this.store.set(key, { value: parsed, expiresAt: Date.now() + 60000 });
          return parsed;
        }
      }
    } catch (err) {
      logger.debug("Redis cache GET fallback to memory", { key });
    }

    logger.debug("Cache MISS", { key });
    return null;
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<boolean> {
    const existed = this.store.delete(key);
    try {
      if (redisConnection && redisConnection.status === "ready") {
        await redisConnection.del(key);
      }
    } catch (err) {
      logger.debug("Redis cache DELETE error", { key });
    }
    return existed;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.store.clear();
    try {
      if (redisConnection && redisConnection.status === "ready") {
        const keys = await redisConnection.keys("syncra:cache:*");
        if (keys.length > 0) {
          await redisConnection.del(...keys);
        }
      }
    } catch (err) {
      logger.debug("Redis cache CLEAR error");
    }
  }

  /**
   * Get or compute a value
   */
  async getOrCompute<T>(key: string, compute: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    logger.debug("Cache COMPUTE", { key });
    const value = await compute();
    await this.set(key, value, ttlMs);
    return value;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        expiresIn: Math.max(0, entry.expiresAt - Date.now()),
        expiresAt: new Date(entry.expiresAt).toISOString(),
      })),
    };
  }
}

export const cache = new Cache();

/**
 * Cache key builders for common scenarios
 */
export const cacheKeys = {
  dashboard: (email: string) => `syncra:cache:dashboard:${email.toLowerCase()}`,
  settings: (userId: string) => `syncra:cache:settings:${userId}`,
  userByEmail: (email: string) => `syncra:cache:user:email:${email.toLowerCase()}`,
  notifications: (userId: string) => `syncra:cache:notifications:${userId}`,
};

/**
 * Cache invalidation helpers
 */
export const invalidateCache = {
  dashboard: (email: string) => {
    cache.delete(cacheKeys.dashboard(email));
  },
  user: (userId: string, email?: string) => {
    cache.delete(cacheKeys.settings(userId));
    cache.delete(cacheKeys.notifications(userId));
    if (email) {
      cache.delete(cacheKeys.dashboard(email));
      cache.delete(cacheKeys.userByEmail(email));
    }
  },
  all: () => {
    cache.clear();
  },
};

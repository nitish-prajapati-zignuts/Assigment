/**
 * In-Memory Caching Utility
 * Provides a simple cache for frequently accessed data
 * In production, use Redis for distributed caching
 */

import { logger } from "./logger";

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Set a value in cache
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTL;
    const expiresAt = Date.now() + ttl;

    this.store.set(key, {
      value,
      expiresAt,
    });

    logger.debug("Cache SET", { key, ttlMs: ttl });

    // Schedule cleanup
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      logger.debug("Cache MISS", { key });
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      logger.debug("Cache EXPIRED", { key });
      return null;
    }

    logger.debug("Cache HIT", { key });
    return entry.value as T;
  }

  /**
   * Delete a value from cache
   */
  delete(key: string): boolean {
    const existed = this.store.has(key);
    if (existed) {
      this.store.delete(key);
      logger.debug("Cache DELETE", { key });
    }
    return existed;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.store.size;
    this.store.clear();
    logger.debug("Cache CLEAR", { entries: size });
  }

  /**
   * Get or compute a value
   */
  async getOrCompute<T>(key: string, compute: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    logger.debug("Cache COMPUTE", { key });
    const value = await compute();
    this.set(key, value, ttlMs);
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
  users: () => "users:all",
  userById: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  meetings: (userId: string, page: number, limit: number) => `meetings:${userId}:${page}:${limit}`,
  meetingById: (id: string) => `meeting:${id}`,
  actionItems: (userId: string, page: number, limit: number) => `action_items:${userId}:${page}:${limit}`,
  actionItemById: (id: string) => `action_item:${id}`,
  actionItemsByMeeting: (meetingId: string) => `action_items:meeting:${meetingId}`,
};

/**
 * Cache invalidation helpers
 */
export const invalidateCache = {
  users: () => {
    cache.delete(cacheKeys.users());
    logger.debug("Cache invalidated: users");
  },

  user: (id: string, email?: string) => {
    cache.delete(cacheKeys.userById(id));
    if (email) {
      cache.delete(cacheKeys.userByEmail(email));
    }
    logger.debug("Cache invalidated: user", { id });
  },

  meetings: (userId: string) => {
    // Invalidate all meeting cache entries for this user
    const stats = cache.getStats();
    stats.entries.forEach((entry) => {
      if (entry.key.startsWith(`meetings:${userId}:`)) {
        cache.delete(entry.key);
      }
    });
    logger.debug("Cache invalidated: meetings", { userId });
  },

  meeting: (id: string, ownerEmail?: string) => {
    cache.delete(cacheKeys.meetingById(id));
    logger.debug("Cache invalidated: meeting", { id });
  },

  actionItems: (userId: string, meetingId?: string) => {
    // Invalidate all action item cache entries
    const stats = cache.getStats();
    stats.entries.forEach((entry) => {
      if (
        entry.key.startsWith(`action_items:${userId}:`) ||
        (meetingId && entry.key === cacheKeys.actionItemsByMeeting(meetingId))
      ) {
        cache.delete(entry.key);
      }
    });
    logger.debug("Cache invalidated: action items", { userId, meetingId });
  },

  actionItem: (id: string) => {
    cache.delete(cacheKeys.actionItemById(id));
    logger.debug("Cache invalidated: action item", { id });
  },

  all: () => {
    cache.clear();
    logger.debug("Cache invalidated: all");
  },
};

/**
 * Cache middleware for GET requests
 */
export const cacheMiddleware = (keyBuilder: (req: any) => string, ttlMs?: number) => {
  return async (req: any, res: any, next: any) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = keyBuilder(req);
    const cached = cache.get(key);

    if (cached !== null) {
      logger.debug("Serving from cache", { key });
      return res.json(cached);
    }

    // Intercept res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      cache.set(key, data, ttlMs);
      return originalJson(data);
    };

    next();
  };
};

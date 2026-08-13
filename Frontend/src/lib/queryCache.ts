/**
 * Query Cache for Frontend
 * Implements client-side caching for API responses to reduce redundant requests
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from query parameters
   */
  private generateKey(endpoint: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }

    const sortedParams = Object.keys(params)
      .sort()
      .map((k) => `${k}=${JSON.stringify(params[k])}`)
      .join("&");

    return `${endpoint}?${sortedParams}`;
  }

  /**
   * Get cached data if not expired
   */
  get<T>(endpoint: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data
   */
  set<T>(endpoint: string, data: T, params?: Record<string, any>, ttl?: number): void {
    const key = this.generateKey(endpoint, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    });
  }

  /**
   * Invalidate cache for an endpoint
   */
  invalidate(endpoint: string, params?: Record<string, any>): void {
    if (!params) {
      // Invalidate all entries for this endpoint
      for (const key of this.cache.keys()) {
        if (key.startsWith(endpoint)) {
          this.cache.delete(key);
        }
      }
    } else {
      const key = this.generateKey(endpoint, params);
      this.cache.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        isExpired: Date.now() - entry.timestamp > entry.ttl,
      })),
    };
  }
}

export const queryCache = new QueryCache();

/**
 * React Hook for cached queries
 */
import { useState, useEffect, useCallback } from "react";
import { api } from "./axios";
import { logger } from "./logger";

export interface UseCachedQueryOptions {
  ttl?: number; // Time to live in milliseconds
  skipCache?: boolean; // Bypass cache
  refetchInterval?: number; // Auto-refetch interval
}

export function useCachedQuery<T>(endpoint: string, params?: Record<string, any>, options?: UseCachedQueryOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchCount, setRefetchCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get from cache first (unless skipCache is true)
      if (!options?.skipCache) {
        const cached = queryCache.get<T>(endpoint, params);
        if (cached) {
          logger.debug("Query cache hit", { endpoint });
          setData(cached);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      logger.debug("Query cache miss, fetching", { endpoint });
      const response = await api.get(endpoint, { params });
      const result = response.data;

      // Cache the response
      queryCache.set(endpoint, result, params, options?.ttl);

      setData(result);
      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Query failed", error, { endpoint });
      setError(error);
      setLoading(false);
    }
  }, [endpoint, params, options?.skipCache, options?.ttl]);

  // Fetch data on mount or when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refetch if interval is set
  useEffect(() => {
    if (!options?.refetchInterval) {
      return;
    }

    const interval = setInterval(fetchData, options.refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, options?.refetchInterval]);

  const refetch = useCallback(async () => {
    queryCache.invalidate(endpoint, params);
    setRefetchCount((c) => c + 1);
    await fetchData();
  }, [endpoint, params, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    refetchCount,
  };
}

/**
 * Hook to invalidate queries
 */
export function useQueryInvalidate() {
  return useCallback((endpoint: string, params?: Record<string, any>) => {
    queryCache.invalidate(endpoint, params);
    logger.debug("Query invalidated", { endpoint });
  }, []);
}

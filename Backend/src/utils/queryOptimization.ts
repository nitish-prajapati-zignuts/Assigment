/**
 * Query Optimization Utilities
 * Provides helpers for efficient database queries with pagination and filtering
 */

import { eq, like, and, or, desc, asc } from "drizzle-orm";

/**
 * Pagination utilities
 */
export interface PaginationInput {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
}

export const calculatePagination = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    totalPages,
  };
};

export const getPaginationOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Query sorting utilities
 */
export type SortOrder = "asc" | "desc";

export const getSortOrder = (order: SortOrder) => {
  return order === "desc" ? desc : asc;
};

/**
 * Text search utility (for simple text search across fields)
 */
export const buildSearchQuery = (
  fields: any[],
  searchTerm: string
): any => {
  if (!searchTerm) return undefined;
  const searchPattern = `%${searchTerm.toLowerCase()}%`;
  return or(...fields.map(field => like(field, searchPattern)));
};

/**
 * Filter builder for common patterns
 */
export const buildFilterQuery = (filters: Record<string, any>): any[] => {
  const conditions: any[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      // This would need to map key names to actual columns
      // Typically used with column references
    }
  }

  return conditions;
};

/**
 * Response builder with pagination
 */
export const buildPaginatedResponse = <T>(
  data: T[],
  pagination: PaginationMeta
) => {
  return {
    data,
    pagination,
  };
};

/**
 * Batch query optimization (prevents N+1 queries)
 */
export interface BatchQueryOptions<T> {
  ids: string[];
  batchSize?: number;
  processor: (batch: string[]) => Promise<T[]>;
}

export const batchQuery = async <T>({
  ids,
  batchSize = 100,
  processor,
}: BatchQueryOptions<T>): Promise<T[]> => {
  const results: T[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }

  return results;
};

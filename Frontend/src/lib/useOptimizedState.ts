/**
 * Optimized State Management Hook
 * Provides efficient state management with memoization and batch updates
 */

import { useState, useCallback, useMemo, useRef } from "react";

/**
 * Custom hook for async state with loading and error handling
 */
export function useAsyncState<T>(initialValue?: T) {
  const [state, setState] = useState<T | undefined>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setStateAsync = useCallback(async (asyncFn: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setState(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { state, loading, error, setState, setStateAsync };
}

/**
 * Custom hook for paginated data
 */
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
}

export function usePaginatedState<T>(initialItems: T[] = [], initialPage = 1, initialLimit = 10) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: initialItems.length,
    hasNextPage: false,
    hasPrevPage: false,
    totalPages: 1,
  });

  const updateItems = useCallback(
    (newItems: T[], total: number) => {
      setItems(newItems);
      const totalPages = Math.ceil(total / pagination.limit);
      setPagination((prev) => ({
        ...prev,
        total,
        totalPages,
        hasNextPage: prev.page < totalPages,
        hasPrevPage: prev.page > 1,
      }));
    },
    [pagination.limit]
  );

  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages)),
    }));
  }, []);

  const nextPage = useCallback(() => {
    goToPage(pagination.page + 1);
  }, [pagination.page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(pagination.page - 1);
  }, [pagination.page, goToPage]);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({
      ...prev,
      limit,
      page: 1,
      totalPages: Math.ceil(prev.total / limit),
    }));
  }, []);

  return {
    items,
    pagination,
    updateItems,
    goToPage,
    nextPage,
    prevPage,
    setLimit,
  };
}

/**
 * Custom hook for filter state
 */
export interface FilterState {
  [key: string]: any;
}

export function useFilterState(initialFilters: FilterState = {}) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => {
      if (prev[key] === value) return prev; // Prevent unnecessary updates
      return { ...prev, [key]: value };
    });
  }, []);

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => {
      const hasChanges = Object.entries(updates).some(([key, value]) => prev[key] !== value);
      if (!hasChanges) return prev; // Prevent unnecessary updates
      return { ...prev, ...updates };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const clearFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilter,
    clearFilters,
    hasFilters: Object.keys(filters).length > 0,
  };
}

/**
 * Custom hook for debounced state
 */
export function useDebouncedState<T>(initialValue: T, delay: number = 500) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateValue = useCallback(
    (newValue: T) => {
      setValue(newValue);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(newValue);
      }, delay);
    },
    [delay]
  );

  return {
    value,
    debouncedValue,
    setValue: updateValue,
  };
}

/**
 * Custom hook for memoized computed values
 */
export function useComputed<T>(computeFn: () => T, dependencies: any[]): T {
  return useMemo(computeFn, dependencies);
}

/**
 * Custom hook for batch state updates
 */
export function useBatchState<T extends Record<string, any>>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const batchUpdateRef = useRef<Partial<T>>({});

  const batchUpdate = useCallback((updates: Partial<T>) => {
    batchUpdateRef.current = { ...batchUpdateRef.current, ...updates };
  }, []);

  const commitBatch = useCallback(() => {
    if (Object.keys(batchUpdateRef.current).length > 0) {
      setState((prev) => ({ ...prev, ...batchUpdateRef.current }));
      batchUpdateRef.current = {};
    }
  }, []);

  const resetBatch = useCallback(() => {
    batchUpdateRef.current = {};
  }, []);

  return {
    state,
    setState,
    batchUpdate,
    commitBatch,
    resetBatch,
  };
}

/**
 * useFetch Hook
 * Generic data fetching hook with caching, error handling, and retry logic
 * Provides a reusable interface for API data fetching across components
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Fetch options configuration
 */
export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  error: string | null;
}

/**
 * Hook return type
 */
interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Global cache for fetch requests
 */
const globalCache = new Map<string, CacheEntry<any>>();

/**
 * useFetch - Generic data fetching hook
 * Handles API requests with caching, error handling, and retry logic
 *
 * @param url - The URL to fetch from
 * @param options - Fetch options (method, headers, body, caching, etc.)
 * @returns {UseFetchReturn<T>} Data state and methods
 *
 * @example
 * const { data, loading, error } = useFetch('/api/images', {
 *   headers: { 'Authorization': `Bearer ${token}` },
 *   cacheTime: 5 * 60 * 1000,
 * });
 */
export const useFetch = <T = any>(url: string, options: FetchOptions = {}): UseFetchReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    method = 'GET',
    headers = {},
    body = null,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    retry = 3,
    retryDelay = 1000,
    timeout = 10000,
  } = options;

  const attemptRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Generate cache key from URL and method
   */
  const getCacheKey = useCallback((): string => {
    return `${method}:${url}`;
  }, [method, url]);

  /**
   * Check if cache is still valid
   */
  const isCacheValid = useCallback(
    (cacheKey: string): boolean => {
      const entry = globalCache.get(cacheKey);
      if (!entry) return false;
      return Date.now() - entry.timestamp < cacheTime;
    },
    [cacheTime],
  );

  /**
   * Perform fetch with retry logic
   */
  const performFetch = useCallback(
    async (forceRefresh = false): Promise<void> => {
      try {
        setLoading(true);
        const cacheKey = getCacheKey();

        // Check cache if not forcing refresh
        if (!forceRefresh && isCacheValid(cacheKey)) {
          const cachedEntry = globalCache.get(cacheKey);
          if (cachedEntry) {
            setData(cachedEntry.data);
            setError(null);
            setLoading(false);
            return;
          }
        }

        // Prepare fetch request
        const controller = new AbortController();
        timeoutRef.current = setTimeout(() => controller.abort(), timeout);

        const fetchOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal: controller.signal,
        };

        if (body && method !== 'GET') {
          fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        // Execute fetch
        const response = await fetch(url, fetchOptions);

        clearTimeout(timeoutRef.current);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Cache the result
        globalCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          error: null,
        });

        setData(result);
        setError(null);
        attemptRef.current = 0;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Retry on timeout
          if (attemptRef.current < retry) {
            attemptRef.current++;
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            await performFetch(forceRefresh);
            return;
          }
          setError('Request timeout');
        } else {
          const message = err instanceof Error ? err.message : 'Fetch failed';

          // Retry on network error
          if (attemptRef.current < retry) {
            attemptRef.current++;
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            await performFetch(forceRefresh);
            return;
          }

          setError(message);
        }
        setLoading(false);
      } finally {
        setLoading(false);
      }
    },
    [url, method, headers, body, timeout, retry, retryDelay, getCacheKey, isCacheValid],
  );

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    const abortController = new AbortController();
    performFetch();
    return () => {
      abortController.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [url, method, performFetch]);

  /**
   * Manual refetch with optional cache bypass
   */
  const refetch = useCallback(async () => {
    attemptRef.current = 0;
    await performFetch(true);
  }, [performFetch]);

  /**
   * Clear cache for this URL
   */
  const clearCache = useCallback(() => {
    const cacheKey = getCacheKey();
    globalCache.delete(cacheKey);
    setData(null);
    setError(null);
  }, [getCacheKey]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
  };
};

export default useFetch;
export {};

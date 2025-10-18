/**
 * useAsync Hook
 * Handles async operation state management with loading and error states
 * Provides a clean interface for managing async operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook return type
 */
interface UseAsyncReturn<T, E = Error> {
  data: T | null;
  loading: boolean;
  error: E | null;
  execute: () => Promise<T>;
  reset: () => void;
  setData: (data: T) => void;
}

/**
 * useAsync - Async operation hook
 * Manages loading, error, and result states for async functions
 *
 * @param asyncFunction - The async function to execute
 * @param immediate - Whether to execute immediately on mount (default: false)
 * @returns {UseAsyncReturn<T>} Async state and methods
 *
 * @example
 * const { data, loading, error, execute } = useAsync(fetchData, false);
 * await execute();
 */
export const useAsync = <T = any, E = Error>(
  asyncFunction: () => Promise<T>,
  immediate = false,
): UseAsyncReturn<T, E> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<E | null>(null);

  const isMountedRef = useRef(true);

  /**
   * Execute the async function
   */
  const execute = useCallback(async (): Promise<T> => {
    try {
      setLoading(true);
      setError(null);

      const result = await asyncFunction();

      if (isMountedRef.current) {
        setData(result);
      }

      return result;
    } catch (err) {
      const error = err as E;
      if (isMountedRef.current) {
        setError(error);
      }
      throw error;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [asyncFunction]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  /**
   * Manually set data
   */
  const setAsyncData = useCallback((newData: T) => {
    if (isMountedRef.current) {
      setData(newData);
    }
  }, []);

  /**
   * Execute immediately on mount if requested
   */
  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData: setAsyncData,
  };
};

export default useAsync;
export {};

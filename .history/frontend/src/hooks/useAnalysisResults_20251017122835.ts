/**
 * useAnalysisResults Hook
 * Manages image analysis results fetching, caching, and state
 * Provides methods to retrieve analysis for images with caching
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Analysis result data structure
 */
export interface AnalysisResult {
  id: string;
  imageId: string;
  analysisType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  results?: Record<string, any>;
  metrics?: Record<string, number>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

/**
 * Hook return type
 */
interface UseAnalysisResultsReturn {
  results: AnalysisResult[];
  loading: boolean;
  error: string | null;
  selectedResult: AnalysisResult | null;
  getAnalysisResults: (imageId: string, accessToken: string, forceRefresh?: boolean) => Promise<AnalysisResult[]>;
  selectResult: (result: AnalysisResult | null) => void;
  clearCache: () => void;
  clearError: () => void;
}

/**
 * Cache entry with timestamp
 */
interface CacheEntry {
  data: AnalysisResult[];
  timestamp: number;
}

/**
 * Cache TTL (5 minutes)
 */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * useAnalysisResults - Analysis results hook
 * Fetches and caches analysis results for images
 *
 * @returns {UseAnalysisResultsReturn} Results state and methods
 *
 * @example
 * const { results, loading, getAnalysisResults } = useAnalysisResults();
 * await getAnalysisResults(imageId, token);
 */
export const useAnalysisResults = (): UseAnalysisResultsReturn => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  // Cache storage
  const cache = useRef<Map<string, CacheEntry>>(new Map());

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  /**
   * Check if cache entry is still valid
   */
  const isCacheValid = useCallback((entry: CacheEntry): boolean => {
    return Date.now() - entry.timestamp < CACHE_TTL;
  }, []);

  /**
   * Fetch analysis results for an image
   */
  const getAnalysisResults = useCallback(
    async (imageId: string, accessToken: string, forceRefresh = false): Promise<AnalysisResult[]> => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cacheKey = `analysis_${imageId}`;
        const cachedEntry = cache.current.get(cacheKey);

        if (cachedEntry && isCacheValid(cachedEntry) && !forceRefresh) {
          setResults(cachedEntry.data);
          return cachedEntry.data;
        }

        // Fetch from API
        const response = await fetch(`${API_URL}/analysis/image/${imageId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch analysis results');
        }

        const data: { data: AnalysisResult[] } = await response.json();

        // Cache the results
        cache.current.set(cacheKey, {
          data: data.data,
          timestamp: Date.now(),
        });

        setResults(data.data);
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch results';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL, isCacheValid],
  );

  /**
   * Fetch analysis results with polling for in-progress jobs
   */
  const pollAnalysisResults = useCallback(
    async (imageId: string, accessToken: string, maxAttempts = 60): Promise<AnalysisResult[]> => {
      let attempts = 0;

      return new Promise(async (resolve, reject) => {
        const poll = async () => {
          try {
            const analysisResults = await getAnalysisResults(imageId, accessToken, true);

            // Check if any analysis is still processing
            const processingCount = analysisResults.filter((r) => r.status === 'processing' || r.status === 'pending')
              .length;

            if (processingCount === 0) {
              resolve(analysisResults);
            } else if (attempts < maxAttempts) {
              attempts++;
              setTimeout(poll, 2000); // Poll every 2 seconds
            } else {
              reject(new Error('Analysis polling timeout'));
            }
          } catch (err) {
            reject(err);
          }
        };

        poll();
      });
    },
    [getAnalysisResults],
  );

  /**
   * Select a specific analysis result
   */
  const selectAnalysisResult = useCallback((result: AnalysisResult | null) => {
    setSelectedResult(result);
  }, []);

  /**
   * Clear all cached analysis results
   */
  const clearCache = useCallback(() => {
    cache.current.clear();
    setResults([]);
    setSelectedResult(null);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    selectedResult,
    getAnalysisResults,
    selectResult: selectAnalysisResult,
    clearCache,
    clearError,
  };
};

export default useAnalysisResults;

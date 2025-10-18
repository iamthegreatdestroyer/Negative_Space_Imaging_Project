/**
 * Hooks Index
 * Centralized exports for all custom hooks
 */

export { useAuth } from './useAuth';
export type { User } from './useAuth';

export { useImageUpload } from './useImageUpload';
export type { ImageMetadata } from './useImageUpload';

export { useAnalysisResults } from './useAnalysisResults';
export type { AnalysisResult } from './useAnalysisResults';

export { useFetch } from './useFetch';
export type { FetchOptions } from './useFetch';

export { useLocalStorage } from './useLocalStorage';

export { useAsync } from './useAsync';

export { useDebounce } from './useDebounce';

export { useWebSocket } from './useWebSocket';

export { useNotification } from './useNotification';
export type { UseNotificationReturn } from './useNotification';
export {};

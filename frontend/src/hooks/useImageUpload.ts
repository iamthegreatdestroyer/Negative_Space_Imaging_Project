/**
 * useImageUpload Hook
 * Manages image file upload logic and progress tracking
 * Handles file validation, multipart uploads, and progress events
 */

import { useState, useCallback } from 'react';

/**
 * Image metadata returned from API
 */
export interface ImageMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  exifData?: Record<string, any>;
  uploadedAt: string;
  uploadedBy: string;
}

/**
 * Upload progress event
 */
interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Hook return type
 */
interface UseImageUploadReturn {
  uploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  uploadedImage: ImageMetadata | null;
  uploadImage: (file: File, accessToken: string) => Promise<ImageMetadata>;
  uploadMultiple: (files: File[], accessToken: string) => Promise<ImageMetadata[]>;
  clearError: () => void;
  resetProgress: () => void;
}

/**
 * Supported image MIME types
 */
const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/tiff',
  'image/raw',
];

/**
 * Maximum file size (100MB)
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * useImageUpload - Image upload hook
 * Manages file upload with progress tracking and validation
 *
 * @returns {UseImageUploadReturn} Upload state and methods
 *
 * @example
 * const { uploadImage, progress, uploading } = useImageUpload();
 * await uploadImage(file, accessToken);
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<ImageMetadata | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File): string | null => {
    if (!file) {
      return 'No file provided';
    }

    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Supported types: ${SUPPORTED_MIME_TYPES.join(', ')}`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds maximum of 100MB. Provided: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    return null;
  }, []);

  /**
   * Upload single image
   */
  const uploadImage = useCallback(
    async (file: File, accessToken: string): Promise<ImageMetadata> => {
      try {
        setUploading(true);
        setError(null);
        setProgress(null);

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          throw new Error(validationError);
        }

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);

        // Create XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress({
              loaded: event.loaded,
              total: event.total,
              percent,
            });
          }
        });

        // Upload via fetch with manual progress
        const response = await fetch(`${API_URL}/images/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Upload failed');
        }

        const data: { data: ImageMetadata } = await response.json();
        setUploadedImage(data.data);
        setProgress({ loaded: file.size, total: file.size, percent: 100 });

        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [API_URL, validateFile],
  );

  /**
   * Upload multiple images sequentially
   */
  const uploadMultiple = useCallback(
    async (files: File[], accessToken: string): Promise<ImageMetadata[]> => {
      const results: ImageMetadata[] = [];

      for (let i = 0; i < files.length; i++) {
        try {
          const image = await uploadImage(files[i], accessToken);
          results.push(image);
        } catch (err) {
          console.error(`Failed to upload file ${i + 1}:`, err);
          // Continue with next file
        }
      }

      return results;
    },
    [uploadImage],
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset progress
   */
  const resetProgress = useCallback(() => {
    setProgress(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadedImage,
    uploadImage,
    uploadMultiple,
    clearError,
    resetProgress,
  };
};

export default useImageUpload;
export {};

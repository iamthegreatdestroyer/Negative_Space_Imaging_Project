/**
 * API Client Service
 * Axios-based HTTP client with JWT auth, error handling, and interceptors
 * Provides centralized API configuration and request/response handling
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

/**
 * API error response structure
 */
interface ApiErrorResponse {
  status: string;
  message: string;
  errors?: Record<string, any>;
  timestamp?: string;
}

/**
 * API success response structure
 */
interface ApiSuccessResponse<T = any> {
  status: string;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * Extended error with API context
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: ApiErrorResponse,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Client configuration
 */
interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  onTokenRefresh?: (newToken: string) => void;
  onUnauthorized?: () => void;
}

/**
 * API Client class
 */
export class ApiClient {
  private client: AxiosInstance;
  private refreshTokenInProgress = false;
  private refreshTokenPromise: Promise<string | null> | null = null;

  constructor(config: ApiClientConfig = {}) {
    const {
      baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
      timeout = 10000,
      onTokenRefresh,
      onUnauthorized,
    } = config;

    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // If token refresh is already in progress, wait for it
            if (this.refreshTokenInProgress) {
              await this.refreshTokenPromise;
              return this.client(originalRequest);
            }

            this.refreshTokenInProgress = true;
            this.refreshTokenPromise = this.refreshAccessToken();

            const newToken = await this.refreshTokenPromise;

            if (newToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              onTokenRefresh?.(newToken);
              return this.client(originalRequest);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            // Token refresh failed, logout user
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            onUnauthorized?.();
            return Promise.reject(this.handleError(error));
          } finally {
            this.refreshTokenInProgress = false;
            this.refreshTokenPromise = null;
          }
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError<ApiErrorResponse>): ApiError {
    if (error.response) {
      const data = error.response.data;
      const message = data?.message || error.message;
      return new ApiError(message, error.response.status, data);
    }

    if (error.request) {
      return new ApiError('No response from server', 0);
    }

    return new ApiError(error.message || 'Request failed', 0);
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return null;
      }

      // Create a new axios instance without interceptors to avoid infinite loop
      const response = await axios.post<ApiSuccessResponse<{ accessToken: string }>>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
        { refreshToken },
        { timeout: 5000 },
      );

      const newAccessToken = response.data.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);

      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<ApiSuccessResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<ApiSuccessResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<ApiSuccessResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch<ApiSuccessResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<ApiSuccessResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  /**
   * Upload file with FormData
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    additionalData?: Record<string, any>,
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await this.client.post<ApiSuccessResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  /**
   * Get the underlying axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new ApiClient({
  onUnauthorized: () => {
    // Trigger logout or redirect to login
    window.dispatchEvent(new CustomEvent('unauthorized'));
  },
});

export default apiClient;
export {};
export {};

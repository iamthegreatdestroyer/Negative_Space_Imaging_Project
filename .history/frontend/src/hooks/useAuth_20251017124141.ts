/**
 * useAuth Hook
 * Manages authentication state and methods with JWT token handling
 * Provides access to user data, tokens, and auth operations
 */

import { useState, useCallback, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

/**
 * Decoded JWT payload structure
 */
interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

/**
 * User data structure
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
}

/**
 * Authentication response from API
 */
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Hook return type
 */
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  clearError: () => void;
}

/**
 * useAuth - Authentication hook
 * Manages user authentication state and provides auth operations
 *
 * @returns {UseAuthReturn} Auth state and methods
 *
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const payload = jwtDecode<TokenPayload>(accessToken);
          // Check if token is still valid
          if (payload.exp * 1000 > Date.now()) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          } else {
            // Token expired, clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user with email and password
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Login failed');
        }

        const data: { data: AuthResponse } = await response.json();
        const { accessToken, refreshToken, user: userData } = data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL],
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Registration failed');
        }

        const data: { data: AuthResponse } = await response.json();
        const { accessToken, refreshToken, user: userData } = data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL],
  );

  /**
   * Logout user and clear auth data
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken) {
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (err) {
          console.error('Error calling logout endpoint:', err);
        }
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  /**
   * Refresh access token using refresh token
   */
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        setError('No refresh token available');
        return false;
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setError('Token refresh failed');
        return false;
      }

      const data: { data: { accessToken: string } } = await response.json();
      localStorage.setItem('accessToken', data.data.accessToken);
      return true;
    } catch (err) {
      console.error('Error refreshing token:', err);
      setError('Token refresh failed');
      return false;
    }
  }, [API_URL]);

  /**
   * Get access token from storage
   */
  const getAccessToken = useCallback(() => {
    return localStorage.getItem('accessToken');
  }, []);

  /**
   * Get refresh token from storage
   */
  const getRefreshToken = useCallback(() => {
    return localStorage.getItem('refreshToken');
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAccessToken,
    getAccessToken,
    getRefreshToken,
    clearError,
  };
};

export default useAuth;

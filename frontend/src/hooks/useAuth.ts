/**
 * Authentication Hook
 * Manages user authentication state and actions
 */

import { useCallback, useState } from 'react';

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
  clearError: () => void;
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement actual login API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password }),
      // });
      setUser({ id: '1', email });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual logout API call
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, firstName?: string, lastName?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Implement actual register API call
        setUser({ id: '1', email, firstName, lastName });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const refreshAccessToken = useCallback(async () => {
    // TODO: Implement token refresh logic
    console.log('Refreshing access token...');
    return true;
  }, []);

  const getAccessToken = useCallback(() => {
    // TODO: Retrieve access token from storage
    return null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    loading: isLoading,
    error,
    login,
    logout,
    register,
    refreshAccessToken,
    getAccessToken,
    clearError,
    isAuthenticated: !!user,
  };
};

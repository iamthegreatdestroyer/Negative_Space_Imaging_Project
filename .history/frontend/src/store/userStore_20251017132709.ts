import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useReducer, useEffect } from 'react';

export interface UserState {
  userId: string | null;
  email: string | null;
  name: string | null;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt?: string;
}

export type UserAction =
  | { type: 'SET_USER'; payload: UserState }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserState> }
  | { type: 'SET_ROLE'; payload: 'user' | 'admin' }
  | { type: 'LOGOUT' };

const initialState: UserState = {
  userId: null,
  email: null,
  name: null,
  role: 'user',
};

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    case 'UPDATE_PROFILE':
      return { ...state, ...action.payload };
    case 'SET_ROLE':
      return { ...state, role: action.payload };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}

const UserStoreContext = createContext<
  | {
      state: UserState;
      setUser: (user: UserState) => void;
      updateProfile: (updates: Partial<UserState>) => void;
      setRole: (role: 'user' | 'admin') => void;
      logout: () => void;
    }
  | undefined
>(undefined);

interface UserStoreProviderProps {
  children: ReactNode;
}

export function UserStoreProvider({ children }: UserStoreProviderProps) {
  const [state, dispatch] = useReducer(userReducer, initialState, (initial) => {
    try {
      const persisted = localStorage.getItem('user-store');
      if (persisted) {
        return JSON.parse(persisted);
      }
    } catch {
      // Silently fail
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem('user-store', JSON.stringify(state));
    } catch {
      // Silently fail
    }
  }, [state]);

  const setUser = useCallback((user: UserState) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserState>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  }, []);

  const setRole = useCallback((role: 'user' | 'admin') => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('user-store');
  }, []);

  const value = { state, setUser, updateProfile, setRole, logout };

  return (
    <UserStoreContext.Provider value={value}>
      {children}
    </UserStoreContext.Provider>
  );
}

export function useUserStore() {
  const context = useContext(UserStoreContext);
  if (!context) {
    throw new Error('useUserStore must be used within UserStoreProvider');
  }
  return context;
}

/**
 * Global Application Store
 * 
 * Central store combining all app-level state (user, images, analysis, UI).
 * Uses Context API + useReducer pattern for predictable state management.
 * Persists critical state to localStorage for session recovery.
 * 
 * Architecture:
 * - Single dispatch for all actions
 * - Typed action creators
 * - Automatic persistence
 * - Selectors for efficient access
 */

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useReducer, useEffect } from 'react';

/**
 * Combined app state
 */
export interface AppState {
  /* UI State */
  isLoading: boolean;
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  /* Global notifications */
  notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  } | null;

  /* Active image/analysis */
  activeImageId: string | null;
  activeAnalysisId: string | null;

  /* Pagination/filtering */
  imageFilter: 'all' | 'recent' | 'favorites' | 'processing';
  imageSort: 'date' | 'name' | 'size';
  currentPage: number;
  pageSize: number;
}

/**
 * Union type for all possible app actions
 */
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SHOW_NOTIFICATION'; payload: AppState['notification'] }
  | { type: 'HIDE_NOTIFICATION' }
  | { type: 'SET_ACTIVE_IMAGE'; payload: string | null }
  | { type: 'SET_ACTIVE_ANALYSIS'; payload: string | null }
  | { type: 'SET_IMAGE_FILTER'; payload: AppState['imageFilter'] }
  | { type: 'SET_IMAGE_SORT'; payload: AppState['imageSort'] }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'RESET' };

/**
 * Initial app state
 */
const initialState: AppState = {
  isLoading: false,
  isSidebarOpen: false,
  theme: 'light',
  notification: null,
  activeImageId: null,
  activeAnalysisId: null,
  imageFilter: 'all',
  imageSort: 'date',
  currentPage: 1,
  pageSize: 10,
};

/**
 * App state reducer
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.payload };

    case 'HIDE_NOTIFICATION':
      return { ...state, notification: null };

    case 'SET_ACTIVE_IMAGE':
      return { ...state, activeImageId: action.payload };

    case 'SET_ACTIVE_ANALYSIS':
      return { ...state, activeAnalysisId: action.payload };

    case 'SET_IMAGE_FILTER':
      return { ...state, imageFilter: action.payload, currentPage: 1 };

    case 'SET_IMAGE_SORT':
      return { ...state, imageSort: action.payload, currentPage: 1 };

    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };

    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload, currentPage: 1 };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/**
 * App store context
 */
const AppStoreContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<AppAction>;
      /* Action methods */
      setLoading: (loading: boolean) => void;
      toggleSidebar: () => void;
      setTheme: (theme: 'light' | 'dark') => void;
      showNotification: (
        message: string,
        severity: 'success' | 'error' | 'warning' | 'info',
        duration?: number,
      ) => void;
      hideNotification: () => void;
      setActiveImage: (imageId: string | null) => void;
      setActiveAnalysis: (analysisId: string | null) => void;
      setImageFilter: (filter: AppState['imageFilter']) => void;
      setImageSort: (sort: AppState['imageSort']) => void;
      setCurrentPage: (page: number) => void;
      setPageSize: (size: number) => void;
      reset: () => void;
    }
  | undefined
>(undefined);

/**
 * Props for AppStoreProvider
 */
interface AppStoreProviderProps {
  children: ReactNode;
}

/**
 * App Store Provider Component
 * 
 * Provides global app state and dispatch to entire application.
 * Automatically persists theme preference to localStorage.
 * 
 * Usage:
 * ```tsx
 * function App() {
 *   return (
 *     <AppStoreProvider>
 *       <Routes>...</Routes>
 *     </AppStoreProvider>
 *   );
 * }
 * ```
 */
export function AppStoreProvider({ children }: AppStoreProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    // Hydrate from localStorage
    try {
      const persisted = localStorage.getItem('app-store');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        return { ...initial, theme: parsed.theme || initial.theme };
      }
    } catch {
      // Silently fail if localStorage is unavailable
    }
    return initial;
  });

  // Persist theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'app-store',
        JSON.stringify({
          theme: state.theme,
        }),
      );
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, [state.theme]);

  // Action methods
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const showNotification = useCallback(
    (
      message: string,
      severity: 'success' | 'error' | 'warning' | 'info' = 'info',
      duration?: number,
    ) => {
      dispatch({
        type: 'SHOW_NOTIFICATION',
        payload: {
          open: true,
          message,
          severity,
          duration,
        },
      });
    },
    [],
  );

  const hideNotification = useCallback(() => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  }, []);

  const setActiveImage = useCallback((imageId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_IMAGE', payload: imageId });
  }, []);

  const setActiveAnalysis = useCallback((analysisId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_ANALYSIS', payload: analysisId });
  }, []);

  const setImageFilter = useCallback((filter: AppState['imageFilter']) => {
    dispatch({ type: 'SET_IMAGE_FILTER', payload: filter });
  }, []);

  const setImageSort = useCallback((sort: AppState['imageSort']) => {
    dispatch({ type: 'SET_IMAGE_SORT', payload: sort });
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const setPageSize = useCallback((size: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: size });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    state,
    dispatch,
    setLoading,
    toggleSidebar,
    setTheme,
    showNotification,
    hideNotification,
    setActiveImage,
    setActiveAnalysis,
    setImageFilter,
    setImageSort,
    setCurrentPage,
    setPageSize,
    reset,
  };

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

/**
 * Hook to access app store
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { state, setLoading, showNotification } = useAppStore();
 *   
 *   useEffect(() => {
 *     setLoading(true);
 *     // ...
 *     showNotification('Success!', 'success');
 *   }, []);
 * }
 * ```
 */
export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return context;
}

/**
 * Selector hooks for accessing specific state slices
 */

export function useAppLoading() {
  const { state, setLoading } = useAppStore();
  return [state.isLoading, setLoading] as const;
}

export function useAppSidebar() {
  const { state, toggleSidebar } = useAppStore();
  return [state.isSidebarOpen, toggleSidebar] as const;
}

export function useAppTheme() {
  const { state, setTheme } = useAppStore();
  return [state.theme, setTheme] as const;
}

export function useAppNotification() {
  const { state, showNotification, hideNotification } = useAppStore();
  return {
    notification: state.notification,
    show: showNotification,
    hide: hideNotification,
  };
}

export function useAppPagination() {
  const { state, setCurrentPage, setPageSize } = useAppStore();
  return {
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    setCurrentPage,
    setPageSize,
  };
}

export function useAppFiltering() {
  const { state, setImageFilter, setImageSort } = useAppStore();
  return {
    filter: state.imageFilter,
    sort: state.imageSort,
    setFilter: setImageFilter,
    setSort: setImageSort,
  };
}

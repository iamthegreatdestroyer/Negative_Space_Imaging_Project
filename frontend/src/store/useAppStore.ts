/**/**

 * Global Application Store * Global Application Store

 * *

 * Central store combining all app-level state (user, images, analysis, UI). * Central store combining all app-level state (user, images, analysis, UI).

 * Uses Context API + useReducer pattern for predictable state management. * Uses Context API + useReducer pattern for predictable state management.

 * Persists critical state to localStorage for session recovery. * Persists critical state to localStorage for session recovery.

 * *

 * Architecture: * Architecture:

 * - Single dispatch for all actions * - Single dispatch for all actions

 * - Typed action creators * - Typed action creators

 * - Automatic persistence * - Automatic persistence

 * - Selectors for efficient access * - Selectors for efficient access

 */ */



import type { ReactNode } from 'react';import type { ReactNode } from 'react';

import { createContext, useCallback, useContext, useReducer, useEffect } from 'react';import { createContext, useCallback, useContext, useReducer, useEffect } from 'react';



/**/**

 * Combined app state * Combined app state

 */ */

export interface AppState {export interface AppState {

  isLoading: boolean;  /* UI State */

  isSidebarOpen: boolean;  isLoading: boolean;

  theme: 'light' | 'dark';  isSidebarOpen: boolean;

  theme: 'light' | 'dark';

  notification: {

    open: boolean;  /* Global notifications */

    message: string;  notification: {

    severity: 'success' | 'error' | 'warning' | 'info';    open: boolean;

    duration?: number;    message: string;

  } | null;    severity: 'success' | 'error' | 'warning' | 'info';

    duration?: number;

  activeImageId: string | null;  } | null;

  activeAnalysisId: string | null;

  /* Active image/analysis */

  imageFilter: 'all' | 'recent' | 'favorites' | 'processing';  activeImageId: string | null;

  imageSort: 'date' | 'name' | 'size';  activeAnalysisId: string | null;

  currentPage: number;

  pageSize: number;  /* Pagination/filtering */

}  imageFilter: 'all' | 'recent' | 'favorites' | 'processing';

  imageSort: 'date' | 'name' | 'size';

/**  currentPage: number;

 * Union type for all possible app actions  pageSize: number;

 */}

export type AppAction =

  | { type: 'SET_LOADING'; payload: boolean }/**

  | { type: 'TOGGLE_SIDEBAR' } * Union type for all possible app actions

  | { type: 'SET_THEME'; payload: 'light' | 'dark' } */

  | { type: 'SHOW_NOTIFICATION'; payload: AppState['notification'] }export type AppAction =

  | { type: 'HIDE_NOTIFICATION' }  | { type: 'SET_LOADING'; payload: boolean }

  | { type: 'SET_ACTIVE_IMAGE'; payload: string | null }  | { type: 'TOGGLE_SIDEBAR' }

  | { type: 'SET_ACTIVE_ANALYSIS'; payload: string | null }  | { type: 'SET_THEME'; payload: 'light' | 'dark' }

  | { type: 'SET_IMAGE_FILTER'; payload: AppState['imageFilter'] }  | { type: 'SHOW_NOTIFICATION'; payload: AppState['notification'] }

  | { type: 'SET_IMAGE_SORT'; payload: AppState['imageSort'] }  | { type: 'HIDE_NOTIFICATION' }

  | { type: 'SET_PAGE'; payload: number }  | { type: 'SET_ACTIVE_IMAGE'; payload: string | null }

  | { type: 'SET_PAGE_SIZE'; payload: number }  | { type: 'SET_ACTIVE_ANALYSIS'; payload: string | null }

  | { type: 'RESET' };  | { type: 'SET_IMAGE_FILTER'; payload: AppState['imageFilter'] }

  | { type: 'SET_IMAGE_SORT'; payload: AppState['imageSort'] }

/**  | { type: 'SET_PAGE'; payload: number }

 * Initial app state  | { type: 'SET_PAGE_SIZE'; payload: number }

 */  | { type: 'RESET' };

const initialState: AppState = {

  isLoading: false,/**

  isSidebarOpen: false, * Initial app state

  theme: 'light', */

  notification: null,const initialState: AppState = {

  activeImageId: null,  isLoading: false,

  activeAnalysisId: null,  isSidebarOpen: false,

  imageFilter: 'all',  theme: 'light',

  imageSort: 'date',  notification: null,

  currentPage: 1,  activeImageId: null,

  pageSize: 10,  activeAnalysisId: null,

};  imageFilter: 'all',

  imageSort: 'date',

/**  currentPage: 1,

 * App state reducer  pageSize: 10,

 */};

function appReducer(state: AppState, action: AppAction): AppState {

  switch (action.type) {/**

    case 'SET_LOADING': * App state reducer

      return { ...state, isLoading: action.payload }; */

function appReducer(state: AppState, action: AppAction): AppState {

    case 'TOGGLE_SIDEBAR':  switch (action.type) {

      return { ...state, isSidebarOpen: !state.isSidebarOpen };    case 'SET_LOADING':

      return { ...state, isLoading: action.payload };

    case 'SET_THEME':

      return { ...state, theme: action.payload };    case 'TOGGLE_SIDEBAR':

      return { ...state, isSidebarOpen: !state.isSidebarOpen };

    case 'SHOW_NOTIFICATION':

      return { ...state, notification: action.payload };    case 'SET_THEME':

      return { ...state, theme: action.payload };

    case 'HIDE_NOTIFICATION':

      return { ...state, notification: null };    case 'SHOW_NOTIFICATION':

      return { ...state, notification: action.payload };

    case 'SET_ACTIVE_IMAGE':

      return { ...state, activeImageId: action.payload };    case 'HIDE_NOTIFICATION':

      return { ...state, notification: null };

    case 'SET_ACTIVE_ANALYSIS':

      return { ...state, activeAnalysisId: action.payload };    case 'SET_ACTIVE_IMAGE':

      return { ...state, activeImageId: action.payload };

    case 'SET_IMAGE_FILTER':

      return { ...state, imageFilter: action.payload, currentPage: 1 };    case 'SET_ACTIVE_ANALYSIS':

      return { ...state, activeAnalysisId: action.payload };

    case 'SET_IMAGE_SORT':

      return { ...state, imageSort: action.payload, currentPage: 1 };    case 'SET_IMAGE_FILTER':

      return { ...state, imageFilter: action.payload, currentPage: 1 };

    case 'SET_PAGE':

      return { ...state, currentPage: action.payload };    case 'SET_IMAGE_SORT':

      return { ...state, imageSort: action.payload, currentPage: 1 };

    case 'SET_PAGE_SIZE':

      return { ...state, pageSize: action.payload, currentPage: 1 };    case 'SET_PAGE':

      return { ...state, currentPage: action.payload };

    case 'RESET':

      return initialState;    case 'SET_PAGE_SIZE':

      return { ...state, pageSize: action.payload, currentPage: 1 };

    default:

      return state;    case 'RESET':

  }      return initialState;

}

    default:

/**      return state;

 * App store context  }

 */}

const AppStoreContext = createContext<{

  state: AppState;/**

  dispatch: React.Dispatch<AppAction>; * App store context

  setLoading: (loading: boolean) => void; */

  toggleSidebar: () => void;const AppStoreContext = createContext<

  setTheme: (theme: 'light' | 'dark') => void;  | {

  showNotification: (      state: AppState;

    message: string,      dispatch: React.Dispatch<AppAction>;

    severity: 'success' | 'error' | 'warning' | 'info',      /* Action methods */

    duration?: number,      setLoading: (loading: boolean) => void;

  ) => void;      toggleSidebar: () => void;

  hideNotification: () => void;      setTheme: (theme: 'light' | 'dark') => void;

  setActiveImage: (imageId: string | null) => void;      showNotification: (

  setActiveAnalysis: (analysisId: string | null) => void;        message: string,

  setImageFilter: (filter: AppState['imageFilter']) => void;        severity: 'success' | 'error' | 'warning' | 'info',

  setImageSort: (sort: AppState['imageSort']) => void;        duration?: number,

  setCurrentPage: (page: number) => void;      ) => void;

  setPageSize: (size: number) => void;      hideNotification: () => void;

  reset: () => void;      setActiveImage: (imageId: string | null) => void;

} | undefined>(undefined);      setActiveAnalysis: (analysisId: string | null) => void;

      setImageFilter: (filter: AppState['imageFilter']) => void;

/**      setImageSort: (sort: AppState['imageSort']) => void;

 * Props for AppStoreProvider      setCurrentPage: (page: number) => void;

 */      setPageSize: (size: number) => void;

interface AppStoreProviderProps {      reset: () => void;

  children: ReactNode;    }

}  | undefined

>(undefined);

/**

 * App Store Provider Component/**

 * * Props for AppStoreProvider

 * Provides global app state and dispatch to entire application. */

 * Automatically persists theme preference to localStorage.interface AppStoreProviderProps {

 */  children: ReactNode;

export function AppStoreProvider({ children }: AppStoreProviderProps) {}

  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {

    try {/**

      const persisted = localStorage.getItem('app-store'); * App Store Provider Component

      if (persisted) { *

        const parsed = JSON.parse(persisted); * Provides global app state and dispatch to entire application.

        return { ...initial, theme: parsed.theme || initial.theme }; * Automatically persists theme preference to localStorage.

      } *

    } catch { * Usage:

      // Silently fail if localStorage is unavailable * ```tsx

    } * function App() {

    return initial; *   return (

  }); *     <AppStoreProvider>

 *       <Routes>...</Routes>

  // Persist theme to localStorage *     </AppStoreProvider>

  useEffect(() => { *   );

    try { * }

      localStorage.setItem( * ```

        'app-store', */

        JSON.stringify({export function AppStoreProvider({ children }: AppStoreProviderProps) {

          theme: state.theme,  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {

        }),    // Hydrate from localStorage

      );    try {

    } catch {      const persisted = localStorage.getItem('app-store');

      // Silently fail if localStorage is unavailable      if (persisted) {

    }        const parsed = JSON.parse(persisted);

  }, [state.theme]);        return { ...initial, theme: parsed.theme || initial.theme };

      }

  // Action methods    } catch {

  const setLoading = useCallback((loading: boolean) => {      // Silently fail if localStorage is unavailable

    dispatch({ type: 'SET_LOADING', payload: loading });    }

  }, []);    return initial;

  });

  const toggleSidebar = useCallback(() => {

    dispatch({ type: 'TOGGLE_SIDEBAR' });  // Persist theme to localStorage

  }, []);  useEffect(() => {

    try {

  const setTheme = useCallback((theme: 'light' | 'dark') => {      localStorage.setItem(

    dispatch({ type: 'SET_THEME', payload: theme });        'app-store',

  }, []);        JSON.stringify({

          theme: state.theme,

  const showNotification = useCallback(        }),

    (      );

      message: string,    } catch {

      severity: 'success' | 'error' | 'warning' | 'info' = 'info',      // Silently fail if localStorage is unavailable

      duration?: number,    }

    ) => {  }, [state.theme]);

      dispatch({

        type: 'SHOW_NOTIFICATION',  // Action methods

        payload: {  const setLoading = useCallback((loading: boolean) => {

          open: true,    dispatch({ type: 'SET_LOADING', payload: loading });

          message,  }, []);

          severity,

          duration,  const toggleSidebar = useCallback(() => {

        },    dispatch({ type: 'TOGGLE_SIDEBAR' });

      });  }, []);

    },

    [],  const setTheme = useCallback((theme: 'light' | 'dark') => {

  );    dispatch({ type: 'SET_THEME', payload: theme });

  }, []);

  const hideNotification = useCallback(() => {

    dispatch({ type: 'HIDE_NOTIFICATION' });  const showNotification = useCallback(

  }, []);    (

      message: string,

  const setActiveImage = useCallback((imageId: string | null) => {      severity: 'success' | 'error' | 'warning' | 'info' = 'info',

    dispatch({ type: 'SET_ACTIVE_IMAGE', payload: imageId });      duration?: number,

  }, []);    ) => {

      dispatch({

  const setActiveAnalysis = useCallback((analysisId: string | null) => {        type: 'SHOW_NOTIFICATION',

    dispatch({ type: 'SET_ACTIVE_ANALYSIS', payload: analysisId });        payload: {

  }, []);          open: true,

          message,

  const setImageFilter = useCallback((filter: AppState['imageFilter']) => {          severity,

    dispatch({ type: 'SET_IMAGE_FILTER', payload: filter });          duration,

  }, []);        },

      });

  const setImageSort = useCallback((sort: AppState['imageSort']) => {    },

    dispatch({ type: 'SET_IMAGE_SORT', payload: sort });    [],

  }, []);  );



  const setCurrentPage = useCallback((page: number) => {  const hideNotification = useCallback(() => {

    dispatch({ type: 'SET_PAGE', payload: page });    dispatch({ type: 'HIDE_NOTIFICATION' });

  }, []);  }, []);



  const setPageSize = useCallback((size: number) => {  const setActiveImage = useCallback((imageId: string | null) => {

    dispatch({ type: 'SET_PAGE_SIZE', payload: size });    dispatch({ type: 'SET_ACTIVE_IMAGE', payload: imageId });

  }, []);  }, []);



  const reset = useCallback(() => {  const setActiveAnalysis = useCallback((analysisId: string | null) => {

    dispatch({ type: 'RESET' });    dispatch({ type: 'SET_ACTIVE_ANALYSIS', payload: analysisId });

  }, []);  }, []);



  const value = {  const setImageFilter = useCallback((filter: AppState['imageFilter']) => {

    state,    dispatch({ type: 'SET_IMAGE_FILTER', payload: filter });

    dispatch,  }, []);

    setLoading,

    toggleSidebar,  const setImageSort = useCallback((sort: AppState['imageSort']) => {

    setTheme,    dispatch({ type: 'SET_IMAGE_SORT', payload: sort });

    showNotification,  }, []);

    hideNotification,

    setActiveImage,  const setCurrentPage = useCallback((page: number) => {

    setActiveAnalysis,    dispatch({ type: 'SET_PAGE', payload: page });

    setImageFilter,  }, []);

    setImageSort,

    setCurrentPage,  const setPageSize = useCallback((size: number) => {

    setPageSize,    dispatch({ type: 'SET_PAGE_SIZE', payload: size });

    reset,  }, []);

  };

  const reset = useCallback(() => {

  return (    dispatch({ type: 'RESET' });

    <AppStoreContext.Provider value={value}>  }, []);

      {children}

    </AppStoreContext.Provider>  const value = {

  );    state,

}    dispatch,

    setLoading,

/**    toggleSidebar,

 * Hook to access app store    setTheme,

 */    showNotification,

export function useAppStore() {    hideNotification,

  const context = useContext(AppStoreContext);    setActiveImage,

  if (!context) {    setActiveAnalysis,

    throw new Error('useAppStore must be used within AppStoreProvider');    setImageFilter,

  }    setImageSort,

  return context;    setCurrentPage,

}    setPageSize,

    reset,

/**  };

 * Selector hooks for accessing specific state slices

 */  return (

    <AppStoreContext.Provider value={value}>

export function useAppLoading() {      {children}

  const { state, setLoading } = useAppStore();    </AppStoreContext.Provider>

  return [state.isLoading, setLoading] as const;  );

}}



export function useAppSidebar() {/**

  const { state, toggleSidebar } = useAppStore(); * Hook to access app store

  return [state.isSidebarOpen, toggleSidebar] as const; *

} * Usage:

 * ```tsx

export function useAppTheme() { * function MyComponent() {

  const { state, setTheme } = useAppStore(); *   const { state, setLoading, showNotification } = useAppStore();

  return [state.theme, setTheme] as const; *

} *   useEffect(() => {

 *     setLoading(true);

export function useAppNotification() { *     // ...

  const { state, showNotification, hideNotification } = useAppStore(); *     showNotification('Success!', 'success');

  return { *   }, []);

    notification: state.notification, * }

    show: showNotification, * ```

    hide: hideNotification, */

  };export function useAppStore() {

}  const context = useContext(AppStoreContext);

  if (!context) {

export function useAppPagination() {    throw new Error('useAppStore must be used within AppStoreProvider');

  const { state, setCurrentPage, setPageSize } = useAppStore();  }

  return {  return context;

    currentPage: state.currentPage,}

    pageSize: state.pageSize,

    setCurrentPage,/**

    setPageSize, * Selector hooks for accessing specific state slices

  }; */

}

export function useAppLoading() {

export function useAppFiltering() {  const { state, setLoading } = useAppStore();

  const { state, setImageFilter, setImageSort } = useAppStore();  return [state.isLoading, setLoading] as const;

  return {}

    filter: state.imageFilter,

    sort: state.imageSort,export function useAppSidebar() {

    setFilter: setImageFilter,  const { state, toggleSidebar } = useAppStore();

    setSort: setImageSort,  return [state.isSidebarOpen, toggleSidebar] as const;

  };}

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
export {};

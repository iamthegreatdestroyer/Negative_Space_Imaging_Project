import React, { type ReactNode } from 'react';
import { createContext, useCallback, useContext, useReducer } from 'react';

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  drawerOpen: boolean;
  modalOpen: boolean;
  modalContent?: string;
}

export type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'OPEN_MODAL'; payload?: string }
  | { type: 'CLOSE_MODAL' }
  | { type: 'RESET' };

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  drawerOpen: false,
  modalOpen: false,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'OPEN_DRAWER':
      return { ...state, drawerOpen: true };
    case 'CLOSE_DRAWER':
      return { ...state, drawerOpen: false };
    case 'OPEN_MODAL':
      return { ...state, modalOpen: true, modalContent: action.payload };
    case 'CLOSE_MODAL':
      return { ...state, modalOpen: false, modalContent: undefined };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const UIStoreContext = createContext<
  | {
      state: UIState;
      toggleSidebar: () => void;
      setTheme: (theme: 'light' | 'dark') => void;
      openDrawer: () => void;
      closeDrawer: () => void;
      openModal: (content?: string) => void;
      closeModal: () => void;
      reset: () => void;
    }
  | undefined
>(undefined);

interface UIStoreProviderProps {
  children: ReactNode;
}

export function UIStoreProvider({ children }: UIStoreProviderProps) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const openDrawer = useCallback(() => {
    dispatch({ type: 'OPEN_DRAWER' });
  }, []);

  const closeDrawer = useCallback(() => {
    dispatch({ type: 'CLOSE_DRAWER' });
  }, []);

  const openModal = useCallback((content?: string) => {
    dispatch({ type: 'OPEN_MODAL', payload: content });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    state,
    toggleSidebar,
    setTheme,
    openDrawer,
    closeDrawer,
    openModal,
    closeModal,
    reset,
  };

  return React.createElement(UIStoreContext.Provider, { value }, children);
}

export function useUIStore() {
  const context = useContext(UIStoreContext);
  if (!context) {
    throw new Error('useUIStore must be used within UIStoreProvider');
  }
  return context;
}

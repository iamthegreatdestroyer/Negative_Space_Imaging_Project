import React, { type ReactNode } from 'react';
import { createContext, useCallback, useContext, useReducer } from 'react';

export interface AnalysisResult {
  id: string;
  imageId: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confidence: number;
  detectedRegions: Array<{
    id: string;
    coordinates: { x: number; y: number; width: number; height: number };
    confidence: number;
    label?: string;
  }>;
  statistics?: {
    totalArea: number;
    averageConfidence: number;
    contrast: number;
    colorProfile: string;
  };
}

export interface AnalysisState {
  analyses: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  isLoading: boolean;
}

export type AnalysisAction =
  | { type: 'ADD_ANALYSIS'; payload: AnalysisResult }
  | { type: 'UPDATE_ANALYSIS'; payload: AnalysisResult }
  | { type: 'SET_CURRENT'; payload: AnalysisResult | null }
  | { type: 'SET_ANALYSES'; payload: AnalysisResult[] }
  | { type: 'REMOVE_ANALYSIS'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR' };

const initialState: AnalysisState = {
  analyses: [],
  currentAnalysis: null,
  isLoading: false,
};

function analysisReducer(state: AnalysisState, action: AnalysisAction): AnalysisState {
  switch (action.type) {
    case 'ADD_ANALYSIS':
      return {
        ...state,
        analyses: [action.payload, ...state.analyses],
      };
    case 'UPDATE_ANALYSIS':
      return {
        ...state,
        analyses: state.analyses.map((a) => (a.id === action.payload.id ? action.payload : a)),
        currentAnalysis:
          state.currentAnalysis?.id === action.payload.id ? action.payload : state.currentAnalysis,
      };
    case 'SET_CURRENT':
      return { ...state, currentAnalysis: action.payload };
    case 'SET_ANALYSES':
      return { ...state, analyses: action.payload };
    case 'REMOVE_ANALYSIS':
      return {
        ...state,
        analyses: state.analyses.filter((a) => a.id !== action.payload),
        currentAnalysis:
          state.currentAnalysis?.id === action.payload ? null : state.currentAnalysis,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

const AnalysisStoreContext = createContext<
  | {
      state: AnalysisState;
      addAnalysis: (analysis: AnalysisResult) => void;
      updateAnalysis: (analysis: AnalysisResult) => void;
      setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
      setAnalyses: (analyses: AnalysisResult[]) => void;
      removeAnalysis: (id: string) => void;
      setLoading: (loading: boolean) => void;
      clearAnalyses: () => void;
    }
  | undefined
>(undefined);

interface AnalysisStoreProviderProps {
  children: ReactNode;
}

export function AnalysisStoreProvider({ children }: AnalysisStoreProviderProps) {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  const addAnalysis = useCallback((analysis: AnalysisResult) => {
    dispatch({ type: 'ADD_ANALYSIS', payload: analysis });
  }, []);

  const updateAnalysis = useCallback((analysis: AnalysisResult) => {
    dispatch({ type: 'UPDATE_ANALYSIS', payload: analysis });
  }, []);

  const setCurrentAnalysis = useCallback((analysis: AnalysisResult | null) => {
    dispatch({ type: 'SET_CURRENT', payload: analysis });
  }, []);

  const setAnalyses = useCallback((analyses: AnalysisResult[]) => {
    dispatch({ type: 'SET_ANALYSES', payload: analyses });
  }, []);

  const removeAnalysis = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ANALYSIS', payload: id });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const clearAnalyses = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const value = {
    state,
    addAnalysis,
    updateAnalysis,
    setCurrentAnalysis,
    setAnalyses,
    removeAnalysis,
    setLoading,
    clearAnalyses,
  };

  return React.createElement(AnalysisStoreContext.Provider, { value }, children);
}

export function useAnalysisStore() {
  const context = useContext(AnalysisStoreContext);
  if (!context) {
    throw new Error('useAnalysisStore must be used within AnalysisStoreProvider');
  }
  return context;
}

import React, { type ReactNode } from 'react';
import { createContext, useCallback, useContext, useReducer, useEffect } from 'react';

export interface ImageItem {
  id: string;
  name: string;
  uploadDate: string;
  size: number;
  format: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'ready' | 'failed';
  progress?: number;
  thumbnail?: string;
}

export interface ImageState {
  images: ImageItem[];
  totalCount: number;
  isLoading: boolean;
}

export type ImageAction =
  | { type: 'ADD_IMAGE'; payload: ImageItem }
  | { type: 'UPDATE_IMAGE'; payload: ImageItem }
  | { type: 'REMOVE_IMAGE'; payload: string }
  | { type: 'SET_IMAGES'; payload: ImageItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'CLEAR_IMAGES' };

const initialState: ImageState = {
  images: [],
  totalCount: 0,
  isLoading: false,
};

function imageReducer(state: ImageState, action: ImageAction): ImageState {
  switch (action.type) {
    case 'ADD_IMAGE':
      return {
        ...state,
        images: [action.payload, ...state.images],
        totalCount: state.totalCount + 1,
      };
    case 'UPDATE_IMAGE':
      return {
        ...state,
        images: state.images.map((img) =>
          img.id === action.payload.id ? action.payload : img,
        ),
      };
    case 'REMOVE_IMAGE':
      return {
        ...state,
        images: state.images.filter((img) => img.id !== action.payload),
        totalCount: Math.max(0, state.totalCount - 1),
      };
    case 'SET_IMAGES':
      return {
        ...state,
        images: action.payload,
        totalCount: action.payload.length,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        images: state.images.map((img) =>
          img.id === action.payload.id
            ? { ...img, progress: action.payload.progress }
            : img,
        ),
      };
    case 'CLEAR_IMAGES':
      return { ...initialState };
    default:
      return state;
  }
}

const ImageStoreContext = createContext<
  | {
      state: ImageState;
      addImage: (image: ImageItem) => void;
      updateImage: (image: ImageItem) => void;
      removeImage: (id: string) => void;
      setImages: (images: ImageItem[]) => void;
      setLoading: (loading: boolean) => void;
      updateProgress: (id: string, progress: number) => void;
      clearImages: () => void;
    }
  | undefined
>(undefined);

interface ImageStoreProviderProps {
  children: React.ReactNode;
}

export function ImageStoreProvider({ children }: ImageStoreProviderProps) {
  const [state, dispatch] = useReducer(imageReducer, initialState);

  const addImage = useCallback((image: ImageItem) => {
    dispatch({ type: 'ADD_IMAGE', payload: image });
  }, []);

  const updateImage = useCallback((image: ImageItem) => {
    dispatch({ type: 'UPDATE_IMAGE', payload: image });
  }, []);

  const removeImage = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_IMAGE', payload: id });
  }, []);

  const setImages = useCallback((images: ImageItem[]) => {
    dispatch({ type: 'SET_IMAGES', payload: images });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: { id, progress } });
  }, []);

  const clearImages = useCallback(() => {
    dispatch({ type: 'CLEAR_IMAGES' });
  }, []);

  const value = {
    state,
    addImage,
    updateImage,
    removeImage,
    setImages,
    setLoading,
    updateProgress,
    clearImages,
  };

  return (
    <ImageStoreContext.Provider value={value}>
      {children}
    </ImageStoreContext.Provider>
  );
}

export function useImageStore() {
  const context = useContext(ImageStoreContext);
  if (!context) {
    throw new Error('useImageStore must be used within ImageStoreProvider');
  }
  return context;
}

/**
 * useLocalStorage Hook
 * Syncs state with browser localStorage for persistent storage
 * Provides automatic serialization/deserialization and error handling
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook return type
 */
interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  clear: () => void;
}

/**
 * useLocalStorage - Persistent local storage hook
 * Syncs component state with localStorage
 *
 * @param key - Storage key
 * @param initialValue - Initial value if not in storage
 * @returns {UseLocalStorageReturn<T>} Value state and methods
 *
 * @example
 * const { value, setValue } = useLocalStorage('theme', 'light');
 */
export const useLocalStorage = <T = any>(
  key: string,
  initialValue?: T,
): UseLocalStorageReturn<T> => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return initialValue ?? ('' as any);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue ?? ('' as any);
    }
  });

  /**
   * Update localStorage when value changes
   */
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }, [key, value]);

  /**
   * Set value with support for function updates
   */
  const setStorageValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        setValue((prevValue) => {
          const valueToStore = newValue instanceof Function ? newValue(prevValue) : newValue;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error updating localStorage key "${key}":`, error);
      }
    },
    [key],
  );

  /**
   * Remove specific key from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setValue(initialValue ?? ('' as any));
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  /**
   * Clear all localStorage
   */
  const clear = useCallback(() => {
    try {
      window.localStorage.clear();
      setValue(initialValue ?? ('' as any));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [initialValue]);

  return {
    value,
    setValue: setStorageValue,
    removeValue,
    clear,
  };
};

export default useLocalStorage;

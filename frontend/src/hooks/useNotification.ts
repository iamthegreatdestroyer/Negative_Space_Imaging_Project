/**
 * Notification Hook
 * Provides notification/toast functionality
 */

import { useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export const useNotification = () => {
  const notify = useCallback(
    (message: string, type: NotificationType = 'info', _duration = 3000) => {
      // TODO: Implement notification display logic
      console.log(`[${type.toUpperCase()}] ${message}`);
    },
    [],
  );

  return {
    notify,
    showNotification: notify, // Alias for backward compatibility
    success: (message: string, duration?: number) => notify(message, 'success', duration),
    error: (message: string, duration?: number) => notify(message, 'error', duration),
    warning: (message: string, duration?: number) => notify(message, 'warning', duration),
    info: (message: string, duration?: number) => notify(message, 'info', duration),
  };
};

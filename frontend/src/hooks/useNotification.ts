/**
 * useNotification Hook
 * Provides easy access to notification context and methods
 * @author Negative Space Imaging Project
 * @version 1.0.0
 */

import { useContext } from 'react';
import {
  NotificationContext,
  Notification,
  NotificationSeverity,
} from '../contexts/NotificationContext';

/**
 * Hook return type
 */
export interface UseNotificationReturn {
  showNotification: (
    message: string,
    severity?: NotificationSeverity,
    duration?: number,
    action?: Notification['action'],
  ) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
}

/**
 * useNotification - Hook to access notification context
 * Provides methods to show different types of notifications
 *
 * @returns {UseNotificationReturn} Notification methods
 *
 * @example
 * const { showNotification, success, error } = useNotification();
 *
 * // Show generic notification
 * showNotification('Loading...', 'info');
 *
 * // Show success
 * success('Profile updated successfully!');
 *
 * // Show error
 * error('Failed to save changes');
 */
export const useNotification = (): UseNotificationReturn => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider. ' +
        'Make sure your component is wrapped with <NotificationProvider>.',
    );
  }

  return {
    showNotification: context.addNotification,
    removeNotification: context.removeNotification,
    clearAll: context.clearNotifications,
    success: context.success,
    error: context.error,
    warning: context.warning,
    info: context.info,
  };
};

export default useNotification;
export {};

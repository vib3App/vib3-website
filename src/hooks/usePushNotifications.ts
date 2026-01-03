/**
 * Push Notifications Hook
 * Provides easy access to push notification functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService, type NotificationPreferences } from '@/services/pushNotifications';
import { useAuthStore } from '@/stores/authStore';

export interface UsePushNotificationsResult {
  isSupported: boolean;
  isLoading: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
  preferences: NotificationPreferences | null;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<boolean>;
}

export function usePushNotifications(): UsePushNotificationsResult {
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  const isSupported = pushNotificationService.isSupported();

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (!isSupported) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Initialize service
        await pushNotificationService.initialize();

        // Get current state
        setPermission(pushNotificationService.getPermissionStatus());
        setIsSubscribed(pushNotificationService.isSubscribed());

        // Load preferences if authenticated
        if (isAuthenticated) {
          const prefs = await pushNotificationService.getPreferences();
          setPreferences(prefs);
        }
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [isSupported, isAuthenticated]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);

    try {
      const subscription = await pushNotificationService.subscribe();

      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);

    try {
      const success = await pushNotificationService.unsubscribe();

      if (success) {
        setIsSubscribed(false);
      }

      return success;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Request permission only (without subscribing)
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied';

    const perm = await pushNotificationService.requestPermission();
    setPermission(perm);
    return perm;
  }, [isSupported]);

  // Update notification preferences
  const updatePreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>): Promise<boolean> => {
      if (!preferences) return false;

      const newPrefs = { ...preferences, ...prefs };

      const success = await pushNotificationService.updatePreferences(newPrefs);

      if (success) {
        setPreferences(newPrefs);
      }

      return success;
    },
    [preferences]
  );

  return {
    isSupported,
    isLoading,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
    preferences,
    updatePreferences,
  };
}

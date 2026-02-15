/**
 * Desktop Notifications Service
 * Handles browser push notifications
 */
import type { Notification as AppNotification } from '@/types';
import { logger } from '@/utils/logger';

class DesktopNotificationsService {
  private isSupported: boolean;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Check if notifications are supported
   */
  isAvailable(): boolean {
    return this.isSupported;
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      logger.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Show a desktop notification
   */
  show(notification: AppNotification): void {
    if (!this.isSupported || this.permission !== 'granted') {
      return;
    }

    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.fromUser?.avatar || '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: notification.id,
      requireInteraction: false,
      silent: false,
      data: {
        notificationId: notification.id,
        type: notification.type,
        videoThumbnail: notification.data?.videoThumbnail,
        ...notification.data,
      },
    };

    try {
      const desktopNotification = new Notification(notification.title, options);

      desktopNotification.onclick = () => {
        window.focus();
        this.handleNotificationClick(notification);
        desktopNotification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        desktopNotification.close();
      }, 5000);
    } catch (error) {
      logger.error('Failed to show notification:', error);
    }
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(notification: AppNotification): void {
    const { type, data } = notification;

    switch (type) {
      case 'like':
      case 'comment':
      case 'mention':
        if (data?.videoId) {
          window.location.href = `/video/${data.videoId}`;
        }
        break;

      case 'follow':
        if (notification.fromUser?.id) {
          window.location.href = `/profile/${notification.fromUser.id}`;
        }
        break;

      case 'message':
        if (data?.conversationId) {
          window.location.href = `/messages/${data.conversationId}`;
        } else {
          window.location.href = '/messages';
        }
        break;

      case 'live':
        if (data?.liveStreamId) {
          window.location.href = `/live/${data.liveStreamId}`;
        }
        break;

      default:
        window.location.href = '/notifications';
    }
  }

  /**
   * Register service worker for push notifications
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      logger.error('Service worker registration failed:', error);
      return null;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    const registration = await this.registerServiceWorker();
    if (!registration) return null;

    try {
      // Wait for the service worker to become active
      // The registration may have an installing/waiting worker that isn't active yet
      let activeRegistration = registration;
      if (!registration.active) {
        // Wait for the service worker to be ready (active)
        activeRegistration = await navigator.serviceWorker.ready;
      }

      const subscription = await activeRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      return subscription;
    } catch (error) {
      logger.error('Failed to subscribe to push:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to unsubscribe from push:', error);
      return false;
    }
  }
}

export const desktopNotifications = new DesktopNotificationsService();

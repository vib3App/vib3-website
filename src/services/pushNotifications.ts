/**
 * Push Notifications Service
 * Handles web push notification registration and management
 */

import { apiClient } from './api/client';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPreferences {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  mentions: boolean;
  messages: boolean;
  liveStreams: boolean;
  promotions: boolean;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isInitialized = false;

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Push notifications not supported');
      return false;
    }

    if (this.isInitialized) {
      return true;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service worker registered:', this.registration.scope);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Check for existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();

      this.isInitialized = true;

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage = (event: MessageEvent) => {
    console.log('Message from service worker:', event.data);

    if (event.data?.type === 'NOTIFICATION_CLICK') {
      // Handle notification click - could dispatch to router or state
      const { data } = event.data;
      window.dispatchEvent(
        new CustomEvent('vib3-notification-click', { detail: data })
      );
    }
  };

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      console.error('Service worker not registered');
      return null;
    }

    // Check permission
    if (Notification.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }
    }

    try {
      // Get VAPID public key from backend
      const vapidKey = await this.getVapidPublicKey();
      if (!vapidKey) {
        console.error('Failed to get VAPID public key');
        return null;
      }

      // Subscribe to push manager
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      console.log('Push subscription created:', this.subscription.endpoint);

      // Send subscription to backend
      await this.sendSubscriptionToServer(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      // Remove from backend
      await this.removeSubscriptionFromServer();

      // Unsubscribe locally
      await this.subscription.unsubscribe();
      this.subscription = null;

      console.log('Unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  /**
   * Check if user is subscribed
   */
  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  /**
   * Get current subscription
   */
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  /**
   * Get VAPID public key from backend
   */
  private async getVapidPublicKey(): Promise<string | null> {
    try {
      const { data } = await apiClient.get<{ publicKey: string }>(
        '/notifications/vapid-public-key'
      );
      return data.publicKey;
    } catch (error) {
      console.error('Failed to get VAPID key:', error);
      // Fallback to env variable if available
      return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
    }
  }

  /**
   * Send subscription to backend
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    const subscriptionData = subscription.toJSON();

    await apiClient.post('/notifications/subscribe', {
      endpoint: subscriptionData.endpoint,
      keys: {
        p256dh: subscriptionData.keys?.p256dh,
        auth: subscriptionData.keys?.auth,
      },
      platform: 'web',
      userAgent: navigator.userAgent,
    });

    console.log('Subscription sent to server');
  }

  /**
   * Remove subscription from backend
   */
  private async removeSubscriptionFromServer(): Promise<void> {
    if (!this.subscription) return;

    await apiClient.post('/notifications/unsubscribe', {
      endpoint: this.subscription.endpoint,
    });
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<boolean> {
    try {
      await apiClient.put('/notifications/preferences', preferences);
      return true;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences | null> {
    try {
      const { data } = await apiClient.get<NotificationPreferences>(
        '/notifications/preferences'
      );
      return data;
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return null;
    }
  }

  /**
   * Show a local notification (for testing)
   */
  async showLocalNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!this.registration) return;

    await this.registration.showNotification(title, {
      icon: '/vib3-logo.png',
      badge: '/vib3-logo.png',
      ...options,
    });
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Clean up
   */
  dispose(): void {
    navigator.serviceWorker.removeEventListener(
      'message',
      this.handleServiceWorkerMessage
    );
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

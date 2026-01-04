import type { NotificationPreferences } from './types';
import { createPushSubscription, removePushSubscription } from './subscription';
import * as preferencesApi from './preferences';

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isInitialized = false;

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Push notifications not supported');
      return false;
    }
    if (this.isInitialized) return true;

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('Service worker registered:', this.registration.scope);
      await navigator.serviceWorker.ready;
      this.subscription = await this.registration.pushManager.getSubscription();
      this.isInitialized = true;
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  private handleServiceWorkerMessage = (event: MessageEvent) => {
    console.log('Message from service worker:', event.data);
    if (event.data?.type === 'NOTIFICATION_CLICK') {
      window.dispatchEvent(new CustomEvent('vib3-notification-click', { detail: event.data.data }));
    }
  };

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) await this.initialize();
    if (!this.registration) {
      console.error('Service worker not registered');
      return null;
    }
    this.subscription = await createPushSubscription(this.registration, () => this.requestPermission());
    return this.subscription;
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) return true;
    const success = await removePushSubscription(this.subscription);
    if (success) this.subscription = null;
    return success;
  }

  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  async updatePreferences(preferences: NotificationPreferences): Promise<boolean> {
    return preferencesApi.updatePreferences(preferences);
  }

  async getPreferences(): Promise<NotificationPreferences | null> {
    return preferencesApi.getPreferences();
  }

  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.registration) return;
    await this.registration.showNotification(title, {
      icon: '/vib3-logo.png',
      badge: '/vib3-logo.png',
      ...options,
    });
  }

  dispose(): void {
    navigator.serviceWorker.removeEventListener('message', this.handleServiceWorkerMessage);
  }
}

export const pushNotificationService = new PushNotificationService();

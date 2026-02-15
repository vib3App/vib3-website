import { apiClient } from '../api/client';
import { urlBase64ToUint8Array } from './types';

export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const { data } = await apiClient.get<{ publicKey: string }>('/notifications/vapid-public-key');
    return data.publicKey;
  } catch (error) {
    console.error('Failed to get VAPID key:', error);
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
  }
}

export async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
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
}

export async function removeSubscriptionFromServer(endpoint: string): Promise<void> {
  await apiClient.post('/notifications/unsubscribe', { endpoint });
}

export async function createPushSubscription(
  registration: ServiceWorkerRegistration,
  requestPermission: () => Promise<NotificationPermission>
): Promise<PushSubscription | null> {
  if (Notification.permission !== 'granted') {
    const permission = await requestPermission();
    if (permission !== 'granted') {
      return null;
    }
  }

  try {
    const vapidKey = await getVapidPublicKey();
    if (!vapidKey) {
      console.error('Failed to get VAPID public key');
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    });

    await sendSubscriptionToServer(subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function removePushSubscription(subscription: PushSubscription): Promise<boolean> {
  try {
    await removeSubscriptionFromServer(subscription.endpoint);
    await subscription.unsubscribe();
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return false;
  }
}

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { websocketService } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';
import type { IncomingCall } from '@/types/call';
import { logger } from '@/utils/logger';

/**
 * Gap #31: VoIP Push Notifications for Web
 *
 * Requests browser Notification permission on mount.
 * Listens to `call:incoming` WebSocket events.
 * When the tab is NOT focused (document.hidden), shows a browser notification.
 * On notification click: focuses the tab so the existing IncomingCallModal appears.
 */

const RINGTONE_HZ = 440;
const RING_DURATION_MS = 2000;

function createRingtone(): { stop: () => void } {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return { stop: () => {} };
  }
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(RINGTONE_HZ, ctx.currentTime);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.setValueAtTime(0, ctx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.3, ctx.currentTime + 1.0);
  gain.gain.setValueAtTime(0, ctx.currentTime + 1.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  const timer = setTimeout(() => {
    osc.stop();
    ctx.close().catch(() => {});
  }, RING_DURATION_MS);
  return {
    stop: () => {
      clearTimeout(timer);
      try { osc.stop(); ctx.close().catch(() => {}); } catch { /* already stopped */ }
    },
  };
}

export function useCallNotifications() {
  const { isAuthenticated } = useAuthStore();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const ringtoneRef = useRef<{ stop: () => void } | null>(null);
  const notificationRef = useRef<Notification | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      setPermissionGranted(true);
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((result) => {
        setPermissionGranted(result === 'granted');
      });
    }
  }, [isAuthenticated]);

  const showBrowserNotification = useCallback((call: IncomingCall) => {
    if (!permissionGranted) return;
    try {
      const isVideoCall = call.type === 'video';
      const notification = new Notification('Incoming Call', {
        body: `${call.callerUsername} is calling you (${isVideoCall ? 'Video' : 'Audio'})`,
        icon: call.callerAvatar || '/icons/icon-192x192.png',
        tag: `call-${call.callId}`,
        requireInteraction: true,
      });

      notificationRef.current = notification;

      // Auto-dismiss after 30 seconds
      const autoClose = setTimeout(() => notification.close(), 30_000);

      notification.onclick = () => {
        window.focus();
        notification.close();
        clearTimeout(autoClose);
      };

      notification.onclose = () => {
        clearTimeout(autoClose);
      };
    } catch (err) {
      logger.error('Failed to show call notification:', err);
    }
  }, [permissionGranted]);

  // Listen to incoming call events
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubIncoming = websocketService.onIncomingCall((call: IncomingCall) => {
      // If tab is NOT focused, show browser notification
      if (document.hidden) {
        showBrowserNotification(call);
      }
      // Always play ringtone (if tab is focused, IncomingCallModal handles visual)
      ringtoneRef.current?.stop();
      ringtoneRef.current = createRingtone();
    });

    // Stop ringtone on call end/accept/reject
    const unsubEnd = websocketService.onCallEnded(() => {
      ringtoneRef.current?.stop();
      ringtoneRef.current = null;
      notificationRef.current?.close();
    });
    const unsubAccepted = websocketService.onCallAccepted(() => {
      ringtoneRef.current?.stop();
      ringtoneRef.current = null;
      notificationRef.current?.close();
    });
    const unsubRejected = websocketService.onCallRejected(() => {
      ringtoneRef.current?.stop();
      ringtoneRef.current = null;
      notificationRef.current?.close();
    });

    return () => {
      unsubIncoming();
      unsubEnd();
      unsubAccepted();
      unsubRejected();
      ringtoneRef.current?.stop();
      notificationRef.current?.close();
    };
  }, [isAuthenticated, showBrowserNotification]);

  return { permissionGranted };
}

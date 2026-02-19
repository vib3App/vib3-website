'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '@/services/websocket';
import { logger } from '@/utils/logger';

interface VoIPCallerInfo {
  callId: string;
  callerId: string;
  callerUsername: string;
  callerAvatar?: string;
  type: string;
}

interface UseVoIPPushResult {
  isRegistered: boolean;
  register: () => Promise<void>;
  unregister: () => void;
}

const RINGTONE_FREQUENCY = 440; // Hz
const RINGTONE_DURATION = 2000; // ms

function playRingtone(): { stop: () => void } {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return { stop: () => {} };
  }

  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(RINGTONE_FREQUENCY, ctx.currentTime);

  // Ring pattern: on 0.5s, off 0.5s, on 0.5s
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.5);
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime + 1.0);
  gainNode.gain.setValueAtTime(0, ctx.currentTime + 1.5);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start();

  const timeout = setTimeout(() => {
    oscillator.stop();
    ctx.close().catch(() => {});
  }, RINGTONE_DURATION);

  return {
    stop: () => {
      clearTimeout(timeout);
      try {
        oscillator.stop();
        ctx.close().catch(() => {});
      } catch {
        // Already stopped
      }
    },
  };
}

function showCallNotification(caller: VoIPCallerInfo): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notification = new Notification('Incoming Call', {
      body: `${caller.callerUsername} is calling you`,
      icon: caller.callerAvatar || '/icons/icon-192x192.png',
      tag: `voip-call-${caller.callId}`,
      requireInteraction: true,
    });

    // Auto-close after 30 seconds
    setTimeout(() => notification.close(), 30000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (err) {
    logger.error('Failed to show call notification:', err);
  }
}

export function useVoIPPush(): UseVoIPPushResult {
  const [isRegistered, setIsRegistered] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const ringtoneRef = useRef<{ stop: () => void } | null>(null);

  // Cleanup ringtone on call end
  useEffect(() => {
    const unsubEnd = websocketService.onCallEnded(() => {
      ringtoneRef.current?.stop();
      ringtoneRef.current = null;
    });

    const unsubAccepted = websocketService.onCallAccepted(() => {
      ringtoneRef.current?.stop();
      ringtoneRef.current = null;
    });

    const unsubRejected = websocketService.onCallRejected(() => {
      ringtoneRef.current?.stop();
      ringtoneRef.current = null;
    });

    return () => {
      unsubEnd();
      unsubAccepted();
      unsubRejected();
      ringtoneRef.current?.stop();
    };
  }, []);

  const register = useCallback(async () => {
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }

    // Subscribe to incoming calls via websocket
    if (unsubRef.current) {
      unsubRef.current();
    }

    const unsub = websocketService.onIncomingCall((call) => {
      const callerInfo: VoIPCallerInfo = {
        callId: call.callId,
        callerId: call.callerId,
        callerUsername: call.callerUsername,
        callerAvatar: call.callerAvatar,
        type: call.type,
      };

      // Show browser notification
      showCallNotification(callerInfo);

      // Play ringtone
      ringtoneRef.current?.stop();
      ringtoneRef.current = playRingtone();
    });

    unsubRef.current = unsub;
    setIsRegistered(true);
    logger.info('VoIP push notifications registered');
  }, []);

  const unregister = useCallback(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    ringtoneRef.current?.stop();
    ringtoneRef.current = null;
    setIsRegistered(false);
    logger.info('VoIP push notifications unregistered');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubRef.current?.();
      ringtoneRef.current?.stop();
    };
  }, []);

  return { isRegistered, register, unregister };
}

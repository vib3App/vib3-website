'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { capsuleApi } from '@/services/api/capsule';
import { pushNotificationService } from '@/services/pushNotifications';
import type { TimeCapsule } from '@/types/capsule';
import { logger } from '@/utils/logger';

interface CapsuleNotification {
  capsuleId: string;
  title: string;
  creatorUsername: string;
  status: 'ready' | 'upcoming';
  unlockAt: string;
  timeRemaining: string;
}

const POLL_INTERVAL = 60_000; // Check every minute

function getTimeRemaining(unlockAt: string): string {
  const now = Date.now();
  const unlock = new Date(unlockAt).getTime();
  const diff = unlock - now;

  if (diff <= 0) return 'Now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/**
 * Gap #81: Time Capsule Delivery Notifications
 * Polls upcoming capsules and shows notifications when they unlock.
 * Provides countdown timers for upcoming capsules.
 */
export function useCapsuleDelivery() {
  const [notifications, setNotifications] = useState<CapsuleNotification[]>([]);
  const [readyCapsules, setReadyCapsules] = useState<TimeCapsule[]>([]);
  const [showReveal, setShowReveal] = useState(false);
  const [revealCapsule, setRevealCapsule] = useState<TimeCapsule | null>(null);
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  /** Check for capsules that have just unlocked */
  const checkCapsules = useCallback(async () => {
    try {
      const upcoming = await capsuleApi.getUpcomingCapsules();
      const capsules = upcoming.capsules || [];

      const now = Date.now();
      const newNotifications: CapsuleNotification[] = [];
      const justUnlocked: TimeCapsule[] = [];

      for (const capsule of capsules) {
        const unlockTime = new Date(capsule.unlockAt).getTime();
        const diff = unlockTime - now;

        if (diff <= 0) {
          // Capsule has unlocked
          if (!notifiedIdsRef.current.has(capsule.id)) {
            notifiedIdsRef.current.add(capsule.id);
            justUnlocked.push(capsule);

            // Show browser notification
            try {
              await pushNotificationService.showLocalNotification(
                'Time Capsule Unlocked!',
                {
                  body: `"${capsule.title}" from @${capsule.creatorUsername} is now available!`,
                  tag: `capsule-${capsule.id}`,
                  data: { type: 'capsule', capsuleId: capsule.id },
                }
              );
            } catch {
              // Notifications may not be permitted
            }
          }

          newNotifications.push({
            capsuleId: capsule.id,
            title: capsule.title,
            creatorUsername: capsule.creatorUsername,
            status: 'ready',
            unlockAt: capsule.unlockAt,
            timeRemaining: 'Now',
          });
        } else {
          // Still upcoming
          newNotifications.push({
            capsuleId: capsule.id,
            title: capsule.title,
            creatorUsername: capsule.creatorUsername,
            status: 'upcoming',
            unlockAt: capsule.unlockAt,
            timeRemaining: getTimeRemaining(capsule.unlockAt),
          });
        }
      }

      setNotifications(newNotifications);

      if (justUnlocked.length > 0) {
        setReadyCapsules(prev => [...justUnlocked, ...prev]);
      }
    } catch (err) {
      logger.error('[CapsuleDelivery] Check failed:', err);
    }
  }, []);

  // Start polling
  useEffect(() => {
    checkCapsules();
    pollRef.current = setInterval(checkCapsules, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [checkCapsules]);

  // Update countdown timers every second
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          timeRemaining: n.status === 'ready' ? 'Now' : getTimeRemaining(n.unlockAt),
          status: new Date(n.unlockAt).getTime() <= Date.now() ? 'ready' : n.status,
        }))
      );
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  /** Open the reveal modal for a capsule */
  const openReveal = useCallback((capsule: TimeCapsule) => {
    setRevealCapsule(capsule);
    setShowReveal(true);
  }, []);

  /** Close the reveal modal */
  const closeReveal = useCallback(() => {
    setShowReveal(false);
    setRevealCapsule(null);
  }, []);

  /** Dismiss a notification */
  const dismissNotification = useCallback((capsuleId: string) => {
    setNotifications(prev => prev.filter(n => n.capsuleId !== capsuleId));
  }, []);

  return {
    notifications,
    readyCapsules,
    showReveal,
    revealCapsule,
    upcomingCount: notifications.filter(n => n.status === 'upcoming').length,
    readyCount: notifications.filter(n => n.status === 'ready').length,
    openReveal,
    closeReveal,
    dismissNotification,
    refresh: checkCapsules,
  };
}

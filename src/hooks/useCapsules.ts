'use client';

import { useState, useEffect } from 'react';
import { capsuleApi } from '@/services/api/capsule';
import type { TimeCapsule } from '@/types/capsule';

export type CapsuleTab = 'upcoming' | 'unlocked' | 'my' | 'received';

export function useCapsules() {
  const [tab, setTab] = useState<CapsuleTab>('upcoming');
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCapsules = async () => {
      setLoading(true);
      try {
        let data: TimeCapsule[];
        switch (tab) {
          case 'upcoming':
            const upcoming = await capsuleApi.getUpcomingCapsules();
            data = upcoming.capsules;
            break;
          case 'unlocked':
            const unlocked = await capsuleApi.getUnlockedCapsules();
            data = unlocked.capsules;
            break;
          case 'my':
            data = await capsuleApi.getMyCapsules();
            break;
          case 'received':
            data = await capsuleApi.getReceivedCapsules();
            break;
        }
        setCapsules(data);
      } catch (err) {
        console.error('Failed to fetch capsules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, [tab]);

  const handleSubscribe = async (capsuleId: string) => {
    try {
      if (subscribedIds.has(capsuleId)) {
        await capsuleApi.unsubscribeFromCapsule(capsuleId);
        setSubscribedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(capsuleId);
          return newSet;
        });
      } else {
        await capsuleApi.subscribeToCapsule(capsuleId, { notifyPush: true });
        setSubscribedIds(prev => new Set([...prev, capsuleId]));
      }
    } catch (err) {
      console.error('Failed to toggle subscription:', err);
    }
  };

  const isSubscribed = (capsuleId: string) => subscribedIds.has(capsuleId);

  return {
    tab,
    setTab,
    capsules,
    loading,
    handleSubscribe,
    isSubscribed,
  };
}

// Utility functions
export function formatTimeUntil(date: string): string {
  const now = new Date();
  const unlock = new Date(date);
  const diff = unlock.getTime() - now.getTime();

  if (diff <= 0) return 'Now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

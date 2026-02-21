'use client';

import { useState, useEffect, useCallback } from 'react';
import { capsuleApi } from '@/services/api/capsule';
import type { TimeCapsule } from '@/types/capsule';
import { logger } from '@/utils/logger';

export type CapsuleTab = 'upcoming' | 'unlocked' | 'my' | 'received';

export function useCapsules() {
  const [tab, setTab] = useState<CapsuleTab>('upcoming');
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());

  // Reset and load first page when tab changes
  useEffect(() => {
    const fetchCapsules = async () => {
      setLoading(true);
      setPage(1);
      setHasMore(false);
      try {
        let data: TimeCapsule[];
        let more = false;
        switch (tab) {
          case 'upcoming': {
            const result = await capsuleApi.getUpcomingCapsules(1, 20);
            data = result.capsules;
            more = result.hasMore;
            break;
          }
          case 'unlocked': {
            const result = await capsuleApi.getUnlockedCapsules(1, 20);
            data = result.capsules;
            more = result.hasMore;
            break;
          }
          case 'my':
            data = await capsuleApi.getMyCapsules();
            break;
          case 'received':
            data = await capsuleApi.getReceivedCapsules();
            break;
        }
        setCapsules(data);
        setHasMore(more);
      } catch (err) {
        logger.error('Failed to fetch capsules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, [tab]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      let data: TimeCapsule[] = [];
      let more = false;
      if (tab === 'upcoming') {
        const result = await capsuleApi.getUpcomingCapsules(nextPage, 20);
        data = result.capsules;
        more = result.hasMore;
      } else if (tab === 'unlocked') {
        const result = await capsuleApi.getUnlockedCapsules(nextPage, 20);
        data = result.capsules;
        more = result.hasMore;
      }
      if (data.length > 0) {
        setCapsules(prev => [...prev, ...data]);
        setPage(nextPage);
      }
      setHasMore(more);
    } catch (err) {
      logger.error('Failed to load more capsules:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, tab]);

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
      logger.error('Failed to toggle subscription:', err);
    }
  };

  const isSubscribed = (capsuleId: string) => subscribedIds.has(capsuleId);

  return {
    tab,
    setTab,
    capsules,
    loading,
    loadingMore,
    hasMore,
    loadMore,
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

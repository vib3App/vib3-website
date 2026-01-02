'use client';

import { useState, useEffect, useRef } from 'react';
import { creatorApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type {
  CreatorAnalytics,
  AnalyticsTrend,
  CreatorVideo,
  TopSupporter,
  CoinBalance,
} from '@/types/creator';
import type { CreatorTab } from '@/components/creator';

export type Period = '7d' | '30d' | '90d' | '1y';

interface UseCreatorReturn {
  activeTab: CreatorTab;
  setActiveTab: (tab: CreatorTab) => void;
  period: Period;
  setPeriod: (period: Period) => void;
  analytics: CreatorAnalytics | null;
  trends: AnalyticsTrend[];
  videos: CreatorVideo[];
  topSupporters: TopSupporter[];
  coinBalance: CoinBalance | null;
  loading: boolean;
}

export function useCreator(): UseCreatorReturn {
  // Use selectors to prevent re-render loops
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthVerified = useAuthStore((s) => s.isAuthVerified);

  const [activeTab, setActiveTab] = useState<CreatorTab>('overview');
  const [period, setPeriod] = useState<Period>('30d');
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrend[]>([]);
  const [videos, setVideos] = useState<CreatorVideo[]>([]);
  const [topSupporters, setTopSupporters] = useState<TopSupporter[]>([]);
  const [coinBalance, setCoinBalance] = useState<CoinBalance | null>(null);
  const [loading, setLoading] = useState(true);

  // Refs to prevent duplicate fetches
  const hasFetchedRef = useRef(false);
  const lastPeriodRef = useRef(period);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Wait for auth verification
    if (!isAuthVerified) {
      return;
    }

    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    // Only fetch once per period change
    if (hasFetchedRef.current && lastPeriodRef.current === period) {
      return;
    }
    hasFetchedRef.current = true;
    lastPeriodRef.current = period;

    const fetchData = async () => {
      try {
        // These endpoints may not exist - handle gracefully
        const results = await Promise.allSettled([
          creatorApi.getAnalytics(period),
          creatorApi.getAnalyticsTrends(period),
          creatorApi.getMyVideos(1, 10),
          creatorApi.getTopSupporters(5),
          creatorApi.getCoinBalance(),
        ]);

        if (!isMountedRef.current) return;

        // Only set state for successful results
        if (results[0].status === 'fulfilled') setAnalytics(results[0].value);
        if (results[1].status === 'fulfilled') setTrends(results[1].value);
        if (results[2].status === 'fulfilled') setVideos(results[2].value.videos);
        if (results[3].status === 'fulfilled') setTopSupporters(results[3].value);
        if (results[4].status === 'fulfilled') setCoinBalance(results[4].value);
      } catch (err) {
        console.error('Failed to fetch creator data:', err);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [period, isAuthenticated, isAuthVerified]);

  return {
    activeTab,
    setActiveTab,
    period,
    setPeriod,
    analytics,
    trends,
    videos,
    topSupporters,
    coinBalance,
    loading,
  };
}

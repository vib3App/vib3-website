'use client';

import { useState, useEffect } from 'react';
import { creatorApi } from '@/services/api';
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
  const [activeTab, setActiveTab] = useState<CreatorTab>('overview');
  const [period, setPeriod] = useState<Period>('30d');
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrend[]>([]);
  const [videos, setVideos] = useState<CreatorVideo[]>([]);
  const [topSupporters, setTopSupporters] = useState<TopSupporter[]>([]);
  const [coinBalance, setCoinBalance] = useState<CoinBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, trendsData, videosData, supportersData, balanceData] = await Promise.all([
          creatorApi.getAnalytics(period),
          creatorApi.getAnalyticsTrends(period),
          creatorApi.getMyVideos(1, 10),
          creatorApi.getTopSupporters(5),
          creatorApi.getCoinBalance(),
        ]);

        setAnalytics(analyticsData);
        setTrends(trendsData);
        setVideos(videosData.videos);
        setTopSupporters(supportersData);
        setCoinBalance(balanceData);
      } catch (err) {
        console.error('Failed to fetch creator data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

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

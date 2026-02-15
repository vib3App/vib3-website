'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/stores/authStore';
import { analyticsApi } from '@/services/api';
import { OverviewStats, ViewsChart, TopVideosTable, AudienceInsights } from '@/components/analytics';
import type { AnalyticsDashboard, AnalyticsPeriod } from '@/types/analytics';
import { logger } from '@/utils/logger';

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'All time' },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [period, setPeriod] = useState<AnalyticsPeriod>(30);
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsApi.getCreatorAnalytics(period);
      setAnalytics(data);
    } catch (err) {
      logger.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (isAuthenticated) fetchAnalytics();
  }, [fetchAnalytics, isAuthVerified, isAuthenticated]);

  if (!isAuthVerified || !isAuthenticated) {
    if (!isAuthVerified) {
      return (
        <div className="min-h-screen aurora-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      );
    }
    router.push('/login?redirect=/analytics');
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8">
        <PageHeader period={period} onPeriodChange={setPeriod} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchAnalytics} className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">Retry</button>
          </div>
        ) : analytics ? (
          <div className="p-6 space-y-8">
            <OverviewStats analytics={analytics} />
            {analytics.viewsHistory && analytics.viewsHistory.length > 0 && (
              <ViewsChart viewsHistory={analytics.viewsHistory} period={period} />
            )}
            <PerformanceMetrics analytics={analytics} />
            <TopVideosTable videos={analytics.topVideos || []} />
            <AudienceInsights analytics={analytics} />
          </div>
        ) : null}
      </main>
    </div>
  );
}

function PageHeader({ period, onPeriodChange }: { period: AnalyticsPeriod; onPeriodChange: (p: AnalyticsPeriod) => void }) {
  return (
    <div className="px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition"><ArrowLeftIcon className="w-5 h-5" /></Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><span>📊</span> Analytics</h1>
          </div>
          <p className="text-white/50 mt-1 ml-12">Track your content performance</p>
        </div>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onPeriodChange(option.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === option.value ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white' : 'glass text-white/70 hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PerformanceMetrics({ analytics }: { analytics: AnalyticsDashboard }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">{analytics.avgWatchTime ?? 0}s</div>
          <div className="text-white/50">Avg Watch Time</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">{analytics.completionRate ?? 0}%</div>
          <div className="text-white/50">Completion Rate</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">{analytics.bestPostingTime ?? 'N/A'}</div>
          <div className="text-white/50">Best Posting Time</div>
        </div>
      </div>
    </section>
  );
}

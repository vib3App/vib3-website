'use client';

import type { AnalyticsDashboard } from '@/types/analytics';
import { formatNumber } from './analyticsUtils';

interface OverviewStatsProps {
  analytics: AnalyticsDashboard;
}

export function OverviewStats({ analytics }: OverviewStatsProps) {
  const stats = [
    { label: 'Total Views', value: formatNumber(analytics.totalViews ?? 0), change: analytics.viewsChange ?? 0, icon: '👁️' },
    { label: 'Followers', value: formatNumber(analytics.totalFollowers ?? 0), change: analytics.followersChange ?? 0, icon: '👥' },
    { label: 'Likes', value: formatNumber(analytics.totalLikes ?? 0), change: analytics.likesChange ?? 0, icon: '❤️' },
    { label: 'Comments', value: formatNumber(analytics.totalComments ?? 0), change: analytics.commentsChange ?? 0, icon: '💬' },
    { label: 'Shares', value: formatNumber(analytics.totalShares ?? 0), change: analytics.sharesChange ?? 0, icon: '🔗' },
    { label: 'Avg Watch Time', value: `${analytics.avgWatchTime ?? 0}s`, change: 0, icon: '⏱️' },
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-white/50 text-sm">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className={`text-sm flex items-center gap-1 mt-1 ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

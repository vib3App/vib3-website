'use client';

import {
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { CreatorAnalytics } from '@/types/creator';

interface CreatorStatsGridProps {
  analytics: CreatorAnalytics;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function CreatorStatsGrid({ analytics }: CreatorStatsGridProps) {
  const stats = [
    { label: 'Total Views', value: analytics.overview.totalViews, icon: EyeIcon, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Likes', value: analytics.overview.totalLikes, icon: HeartIcon, color: 'from-pink-500 to-red-500' },
    { label: 'Total Comments', value: analytics.overview.totalComments, icon: ChatBubbleLeftIcon, color: 'from-purple-500 to-indigo-500' },
    { label: 'Followers', value: analytics.overview.totalFollowers, icon: UserGroupIcon, color: 'from-green-500 to-teal-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white/5 rounded-2xl p-4">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCount(stat.value)}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}

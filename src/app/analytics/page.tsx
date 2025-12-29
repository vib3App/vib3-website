'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { analyticsApi } from '@/services/api';
import type { AnalyticsDashboard, AnalyticsPeriod, TopVideo } from '@/types/analytics';

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatChange(change: number): string {
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
}

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'All time' },
];

export default function AnalyticsPage() {
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
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const overviewStats = analytics
    ? [
        { label: 'Total Views', value: formatNumber(analytics.totalViews), change: analytics.viewsChange, icon: '👁️' },
        { label: 'Followers', value: formatNumber(analytics.totalFollowers), change: analytics.followersChange, icon: '👥' },
        { label: 'Likes', value: formatNumber(analytics.totalLikes), change: analytics.likesChange, icon: '❤️' },
        { label: 'Comments', value: formatNumber(analytics.totalComments), change: analytics.commentsChange, icon: '💬' },
        { label: 'Shares', value: formatNumber(analytics.totalShares), change: analytics.sharesChange, icon: '🔗' },
        { label: 'Avg Watch Time', value: `${analytics.avgWatchTime}s`, change: 0, icon: '⏱️' },
      ]
    : [];

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8">
        {/* Header */}
        <div className="px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
                  <ArrowLeftIcon className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <span>📊</span> Analytics
                </h1>
              </div>
              <p className="text-white/50 mt-1 ml-12">Track your content performance</p>
            </div>
            <div className="flex gap-2">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriod(option.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    period === option.value
                      ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
                      : 'glass text-white/70 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              Retry
            </button>
          </div>
        ) : analytics ? (
          <div className="p-6 space-y-8">
            {/* Overview Stats */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {overviewStats.map((stat, index) => (
                  <div key={index} className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-white/50 text-sm">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div
                      className={`text-sm flex items-center gap-1 mt-1 ${
                        stat.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Views Chart */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Views Over Time</h2>
              <div className="glass-card p-6">
                <div className="h-64 flex items-end justify-between gap-1">
                  {analytics.viewsHistory.map((views, i) => {
                    const maxViews = Math.max(...analytics.viewsHistory, 1);
                    const height = (views / maxViews) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-purple-500 to-teal-400 rounded-t-sm transition-all hover:opacity-80 group relative"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          {formatNumber(views)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 text-white/40 text-xs">
                  <span>{period} days ago</span>
                  <span>{Math.floor(period / 2)} days ago</span>
                  <span>Today</span>
                </div>
              </div>
            </section>

            {/* Performance Metrics */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">{analytics.avgWatchTime}s</div>
                  <div className="text-white/50">Avg Watch Time</div>
                </div>
                <div className="glass-card p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">{analytics.completionRate}%</div>
                  <div className="text-white/50">Completion Rate</div>
                </div>
                <div className="glass-card p-6 text-center">
                  <div className="text-2xl font-bold text-white mb-2">{analytics.bestPostingTime}</div>
                  <div className="text-white/50">Best Posting Time</div>
                </div>
              </div>
            </section>

            {/* Top Videos */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Top Performing Videos</h2>
              <div className="glass-card overflow-hidden">
                {analytics.topVideos.length === 0 ? (
                  <div className="p-8 text-center text-white/50">
                    No videos yet. Start creating to see your analytics!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/50 text-sm font-medium px-6 py-4">Video</th>
                          <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Views</th>
                          <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Likes</th>
                          <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topVideos.map((video: TopVideo, index: number) => (
                          <tr
                            key={video._id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <Link href={`/video/${video._id}`} className="flex items-center gap-3 hover:opacity-80">
                                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/50 font-medium">
                                  {index + 1}
                                </div>
                                {video.thumbnail && (
                                  <img
                                    src={video.thumbnail}
                                    alt=""
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                )}
                                <span className="text-white line-clamp-1">{video.title}</span>
                              </Link>
                            </td>
                            <td className="px-6 py-4 text-right text-white/70">
                              {formatNumber(video.views)}
                            </td>
                            <td className="px-6 py-4 text-right text-white/70">
                              {formatNumber(video.likes)}
                            </td>
                            <td className="px-6 py-4 text-right text-white/70">
                              {formatNumber(video.comments)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* Audience Insights */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Audience Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Age Distribution */}
                <div className="glass-card p-6">
                  <h3 className="text-white font-medium mb-4">Age Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.demographics).map(([range, percentage]) => (
                      <div key={range}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/70">{range}</span>
                          <span className="text-white">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Split */}
                <div className="glass-card p-6">
                  <h3 className="text-white font-medium mb-4">Gender Split</h3>
                  <div className="flex justify-center mb-4">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="20"
                          strokeDasharray={`${analytics.genderMale * 2.51} 251`}
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#ec4899"
                          strokeWidth="20"
                          strokeDasharray={`${analytics.genderFemale * 2.51} 251`}
                          strokeDashoffset={`-${analytics.genderMale * 2.51}`}
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-white/70">Male {analytics.genderMale}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500" />
                      <span className="text-white/70">Female {analytics.genderFemale}%</span>
                    </div>
                  </div>
                </div>

                {/* Traffic Sources */}
                <div className="glass-card p-6">
                  <h3 className="text-white font-medium mb-4">Traffic Sources</h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.trafficSources).map(([source, percentage]) => {
                      const labels: Record<string, string> = {
                        forYou: 'For You',
                        following: 'Following',
                        profile: 'Profile',
                        search: 'Search',
                        other: 'Other',
                      };
                      return (
                        <div key={source} className="flex items-center gap-3">
                          <span className="text-white/70 flex-1">{labels[source] || source}</span>
                          <span className="text-white font-medium">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

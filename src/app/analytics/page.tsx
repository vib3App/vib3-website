'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';

interface StatCard {
  label: string;
  value: string;
  change: number;
  icon: string;
}

const overviewStats: StatCard[] = [
  { label: 'Total Views', value: '1.2M', change: 12.5, icon: '👁️' },
  { label: 'Followers', value: '45.2K', change: 8.3, icon: '👥' },
  { label: 'Likes', value: '892K', change: 15.7, icon: '❤️' },
  { label: 'Comments', value: '23.4K', change: -2.1, icon: '💬' },
  { label: 'Shares', value: '12.8K', change: 22.4, icon: '🔗' },
  { label: 'Watch Time', value: '4.2M min', change: 18.9, icon: '⏱️' },
];

const topVideos = [
  { id: 1, title: 'Dance Challenge Video', views: 450000, likes: 89000, comments: 2300 },
  { id: 2, title: 'Comedy Skit #42', views: 320000, likes: 67000, comments: 1800 },
  { id: 3, title: 'Tutorial: Pro Editing Tips', views: 280000, likes: 54000, comments: 3200 },
  { id: 4, title: 'Behind the Scenes', views: 150000, likes: 32000, comments: 890 },
];

const audienceData = {
  ageGroups: [
    { range: '13-17', percentage: 15 },
    { range: '18-24', percentage: 42 },
    { range: '25-34', percentage: 28 },
    { range: '35-44', percentage: 10 },
    { range: '45+', percentage: 5 },
  ],
  genderSplit: { male: 45, female: 52, other: 3 },
  topCountries: [
    { country: 'United States', percentage: 35 },
    { country: 'United Kingdom', percentage: 15 },
    { country: 'Canada', percentage: 12 },
    { country: 'Australia', percentage: 8 },
    { country: 'Germany', percentage: 6 },
  ],
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

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
              {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
                      : 'glass text-white/70 hover:bg-white/10'
                  }`}
                >
                  {range === '7d' && 'Last 7 days'}
                  {range === '30d' && 'Last 30 days'}
                  {range === '90d' && 'Last 90 days'}
                  {range === 'all' && 'All time'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Overview Stats */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {overviewStats.map((stat, index) => (
                <div
                  key={index}
                  className="glass-card p-4"
                >
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
                    {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Chart Placeholder */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Views Over Time</h2>
            <div className="glass-card p-6">
              <div className="h-64 flex items-end justify-between gap-2">
                {[45, 62, 78, 55, 89, 95, 72, 88, 92, 68, 75, 82, 90, 85].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-sm transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-white/40 text-xs">
                <span>2 weeks ago</span>
                <span>1 week ago</span>
                <span>Today</span>
              </div>
            </div>
          </section>

          {/* Top Videos */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Top Performing Videos</h2>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/50 text-sm font-medium px-6 py-4">
                        Video
                      </th>
                      <th className="text-right text-white/50 text-sm font-medium px-6 py-4">
                        Views
                      </th>
                      <th className="text-right text-white/50 text-sm font-medium px-6 py-4">
                        Likes
                      </th>
                      <th className="text-right text-white/50 text-sm font-medium px-6 py-4">
                        Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topVideos.map((video, index) => (
                      <tr
                        key={video.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/50 font-medium">
                              {index + 1}
                            </div>
                            <span className="text-white">{video.title}</span>
                          </div>
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
                  {audienceData.ageGroups.map((group) => (
                    <div key={group.range}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">{group.range}</span>
                        <span className="text-white">{group.percentage}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full"
                          style={{ width: `${group.percentage}%` }}
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
                        strokeDasharray={`${audienceData.genderSplit.male * 2.51} 251`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#ec4899"
                        strokeWidth="20"
                        strokeDasharray={`${audienceData.genderSplit.female * 2.51} 251`}
                        strokeDashoffset={`-${audienceData.genderSplit.male * 2.51}`}
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-white/70">Male {audienceData.genderSplit.male}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                    <span className="text-white/70">Female {audienceData.genderSplit.female}%</span>
                  </div>
                </div>
              </div>

              {/* Top Countries */}
              <div className="glass-card p-6">
                <h3 className="text-white font-medium mb-4">Top Countries</h3>
                <div className="space-y-3">
                  {audienceData.topCountries.map((country, index) => (
                    <div key={country.country} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/50">
                        {index + 1}
                      </div>
                      <span className="text-white/70 flex-1">{country.country}</span>
                      <span className="text-white font-medium">{country.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

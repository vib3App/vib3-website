'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChartBarIcon,
  VideoCameraIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  PlusIcon,
  ClockIcon,
  GiftIcon,
  CreditCardIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { creatorApi } from '@/services/api';
import type {
  CreatorAnalytics,
  AnalyticsTrend,
  CreatorVideo,
  TopSupporter,
  CoinBalance,
} from '@/types/creator';

type Tab = 'overview' | 'content' | 'monetization' | 'audience' | 'settings';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

export default function CreatorPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
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

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'content', label: 'Content', icon: VideoCameraIcon },
    { id: 'monetization', label: 'Monetization', icon: CurrencyDollarIcon },
    { id: 'audience', label: 'Audience', icon: UserGroupIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const stats = analytics ? [
    { label: 'Total Views', value: analytics.overview.totalViews, icon: EyeIcon, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Likes', value: analytics.overview.totalLikes, icon: HeartIcon, color: 'from-pink-500 to-red-500' },
    { label: 'Total Comments', value: analytics.overview.totalComments, icon: ChatBubbleLeftIcon, color: 'from-purple-500 to-indigo-500' },
    { label: 'Followers', value: analytics.overview.totalFollowers, icon: UserGroupIcon, color: 'from-green-500 to-teal-500' },
  ] : [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-bold">Creator Studio</h1>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium text-sm hover:opacity-90 transition"
          >
            <PlusIcon className="w-4 h-4" />
            Upload
          </Link>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-white/10 overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Period Selector */}
                <div className="flex gap-2">
                  {(['7d', '30d', '90d', '1y'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        period === p
                          ? 'bg-white text-black'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {p === '7d' ? '7 days' : p === '30d' ? '30 days' : p === '90d' ? '90 days' : '1 year'}
                    </button>
                  ))}
                </div>

                {/* Stats Grid */}
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

                {/* Revenue Card */}
                {analytics && (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                          <BanknotesIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Total Revenue</div>
                          <div className="text-3xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
                        </div>
                      </div>
                      <Link
                        href="/creator/payouts"
                        className="px-4 py-2 bg-yellow-500 text-black rounded-full font-medium text-sm hover:bg-yellow-400 transition"
                      >
                        Withdraw
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <div className="text-sm text-gray-400">From Gifts</div>
                        <div className="text-lg font-semibold">{formatCurrency(analytics.revenueBreakdown.gifts)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">From Subscriptions</div>
                        <div className="text-lg font-semibold">{formatCurrency(analytics.revenueBreakdown.subscriptions)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Pending</div>
                        <div className="text-lg font-semibold">{formatCurrency(analytics.revenueBreakdown.pending)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Performing Videos */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Top Performing Videos</h2>
                    <button
                      onClick={() => setActiveTab('content')}
                      className="text-pink-400 text-sm hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-3">
                    {videos.slice(0, 5).map((video, i) => (
                      <div
                        key={video.id}
                        className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
                      >
                        <span className="w-6 text-center font-bold text-gray-400">{i + 1}</span>
                        <div className="w-16 aspect-video bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <VideoCameraIcon className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{video.title}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {formatCount(video.views)}
                          </div>
                          <div className="flex items-center gap-1">
                            <HeartIcon className="w-4 h-4" />
                            {formatCount(video.likes)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Top Supporters */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">Top Supporters</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topSupporters.map(supporter => (
                      <div key={supporter.userId} className="bg-white/5 rounded-xl p-4 text-center">
                        <div className="relative inline-block mb-3">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
                            {supporter.avatar ? (
                              <img src={supporter.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                                {supporter.username[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                            #{supporter.rank}
                          </div>
                        </div>
                        <div className="font-medium truncate">{supporter.username}</div>
                        <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                          <GiftIcon className="w-3 h-3" />
                          {formatCount(supporter.totalCoins)} coins
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Video Filters */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium">
                      All
                    </button>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition">
                      Published
                    </button>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition">
                      Drafts
                    </button>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition">
                      Scheduled
                    </button>
                  </div>
                </div>

                {/* Videos List */}
                <div className="space-y-3">
                  {videos.map(video => (
                    <div
                      key={video.id}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition"
                    >
                      <div className="w-32 aspect-video bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <VideoCameraIcon className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-xs">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium mb-1">{video.title}</div>
                        <div className="text-sm text-gray-400 line-clamp-1">{video.description}</div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            video.status === 'published' ? 'bg-green-500/20 text-green-400' :
                            video.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                            video.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {video.status}
                          </span>
                          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{formatCount(video.views)}</div>
                          <div className="text-gray-400">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{formatCount(video.likes)}</div>
                          <div className="text-gray-400">Likes</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{formatCount(video.comments)}</div>
                          <div className="text-gray-400">Comments</div>
                        </div>
                      </div>

                      <button className="p-2 hover:bg-white/10 rounded-full transition">
                        <Cog6ToothIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'monetization' && (
              <div className="space-y-6">
                {/* Balance Card */}
                {coinBalance && (
                  <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Your Coin Balance</div>
                        <div className="text-4xl font-bold flex items-center gap-2">
                          <span className="text-yellow-400">💰</span>
                          {formatCount(coinBalance.balance)}
                        </div>
                        <div className="text-sm text-gray-400 mt-2">
                          ≈ {formatCurrency(coinBalance.balance * 0.5)} USD
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/creator/payouts"
                          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
                        >
                          Withdraw
                        </Link>
                        <Link
                          href="/coins"
                          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition text-center"
                        >
                          Buy Coins
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                      <div>
                        <div className="text-sm text-gray-400">Total Earned</div>
                        <div className="text-xl font-semibold">{formatCount(coinBalance.totalEarned)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Total Spent</div>
                        <div className="text-xl font-semibold">{formatCount(coinBalance.totalSpent)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Pending</div>
                        <div className="text-xl font-semibold">{formatCount(coinBalance.pendingBalance)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monetization Options */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-2xl p-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                      <GiftIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Gifts</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Receive virtual gifts from your supporters during videos and live streams.
                    </p>
                    <div className="text-2xl font-bold text-yellow-400">
                      {analytics ? formatCount(analytics.revenueBreakdown.gifts / 100) : 0} coins
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                      <UserGroupIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Subscriptions</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Offer exclusive content to paying subscribers with monthly memberships.
                    </p>
                    <Link
                      href="/creator/subscriptions"
                      className="text-pink-400 text-sm hover:underline"
                    >
                      Set up subscriptions →
                    </Link>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4">
                      <CreditCardIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Tips</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Allow fans to send you one-time tips to show their support.
                    </p>
                    <Link
                      href="/creator/settings"
                      className="text-pink-400 text-sm hover:underline"
                    >
                      Enable tips →
                    </Link>
                  </div>
                </div>

                {/* Recent Gifts */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">Recent Gifts</h2>
                  <div className="bg-white/5 rounded-xl p-4 text-center text-gray-400">
                    No gifts received yet
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'audience' && analytics && (
              <div className="space-y-6">
                {/* Follower Growth */}
                <div className="bg-white/5 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Follower Growth</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-bold">{formatCount(analytics.overview.totalFollowers)}</div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                      analytics.overview.followerGrowth >= 0
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {analytics.overview.followerGrowth >= 0 ? (
                        <ArrowUpIcon className="w-3 h-3" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3" />
                      )}
                      {Math.abs(analytics.overview.followerGrowth)}%
                    </div>
                  </div>
                  <div className="h-40 flex items-end gap-1">
                    {trends.map((trend, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-pink-500 to-purple-500 rounded-t"
                        style={{
                          height: `${(trend.followers / Math.max(...trends.map(t => t.followers))) * 100}%`,
                          minHeight: '4px',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Demographics */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Age Groups */}
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold mb-4">Age Groups</h3>
                    <div className="space-y-3">
                      {analytics.audienceInsights.demographics.ageGroups.map(group => (
                        <div key={group.range} className="flex items-center gap-3">
                          <span className="w-12 text-sm text-gray-400">{group.range}</span>
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                              style={{ width: `${group.percentage}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-sm">{group.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Countries */}
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold mb-4">Top Countries</h3>
                    <div className="space-y-3">
                      {analytics.audienceInsights.demographics.countries.slice(0, 5).map(country => (
                        <div key={country.country} className="flex items-center gap-3">
                          <span className="w-24 text-sm truncate">{country.country}</span>
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-sm">{country.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active Hours */}
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4">When Your Audience is Active</h3>
                  <div className="h-32 flex items-end gap-1">
                    {analytics.audienceInsights.activeHours.map((hour, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-pink-500/50 to-purple-500/50 rounded-t hover:from-pink-500 hover:to-purple-500 transition group relative"
                        style={{
                          height: `${hour.percentage}%`,
                          minHeight: '4px',
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black rounded text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          {hour.hour}:00 - {hour.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>12AM</span>
                    <span>6AM</span>
                    <span>12PM</span>
                    <span>6PM</span>
                    <span>12AM</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl space-y-6">
                <div className="bg-white/5 rounded-2xl p-6 space-y-6">
                  <h2 className="text-lg font-semibold">Monetization Settings</h2>

                  <div className="flex items-center justify-between py-4 border-b border-white/10">
                    <div>
                      <div className="font-medium">Enable Gifts</div>
                      <div className="text-sm text-gray-400">Allow viewers to send you gifts</div>
                    </div>
                    <button className="w-12 h-6 bg-pink-500 rounded-full">
                      <div className="w-5 h-5 bg-white rounded-full translate-x-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-white/10">
                    <div>
                      <div className="font-medium">Enable Tips</div>
                      <div className="text-sm text-gray-400">Allow one-time tips from fans</div>
                    </div>
                    <button className="w-12 h-6 bg-white/20 rounded-full">
                      <div className="w-5 h-5 bg-white rounded-full translate-x-0.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <div className="font-medium">Enable Subscriptions</div>
                      <div className="text-sm text-gray-400">Offer monthly memberships</div>
                    </div>
                    <button className="w-12 h-6 bg-white/20 rounded-full">
                      <div className="w-5 h-5 bg-white rounded-full translate-x-0.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 space-y-6">
                  <h2 className="text-lg font-semibold">Payout Settings</h2>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Payout Method</label>
                    <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500">
                      <option>Stripe</option>
                      <option>PayPal</option>
                      <option>Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Minimum Payout ($)</label>
                    <input
                      type="number"
                      defaultValue={50}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition">
                    Connect Stripe Account
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/ui/TopNav';
import { BottomNav } from '@/components/ui/BottomNav';
import { achievementsApi } from '@/services/api/achievements';
import {
  ACHIEVEMENT_CATEGORIES,
  TIER_COLORS,
  type Achievement,
  type AchievementStats,
  type AchievementCategory,
  type LeaderboardEntry,
} from '@/types/achievement';

function StatsHeader({ stats }: { stats: AchievementStats | null }) {
  if (!stats) return null;

  return (
    <div className="bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-6">
        {/* Level Circle */}
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="url(#levelGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${stats.xpProgress * 2.26} 226`}
            />
            <defs>
              <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{stats.level}</span>
            <span className="text-xs text-white/50">LEVEL</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-white">{stats.totalXp.toLocaleString()}</span>
            <span className="text-white/50">XP</span>
          </div>
          <div className="text-sm text-white/60 mb-2">
            {stats.nextLevelXp - stats.currentLevelXp} XP to level {stats.level + 1}
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-white font-medium">{stats.unlockedCount}</span>
              <span className="text-white/50">/{stats.totalCount} unlocked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const tierColor = TIER_COLORS[achievement.tier] || TIER_COLORS.bronze;

  return (
    <div
      className={`p-4 rounded-xl transition-all ${
        achievement.unlocked
          ? 'bg-white/10 border border-white/10'
          : 'bg-white/5 border border-white/5 opacity-70'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            achievement.unlocked ? '' : 'grayscale opacity-50'
          }`}
          style={{ backgroundColor: `${tierColor}20` }}
        >
          {getAchievementIcon(achievement.icon)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-medium truncate">{achievement.name}</h3>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${tierColor}30`, color: tierColor }}
            >
              {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
            </span>
          </div>
          <p className="text-white/50 text-sm mb-2">{achievement.description}</p>

          {/* Progress or XP */}
          {!achievement.unlocked && achievement.progress ? (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">
                  {achievement.progress.current}/{achievement.progress.target}
                </span>
                <span className="text-white/40">{achievement.progress.percentage}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${achievement.progress.percentage}%`,
                    backgroundColor: tierColor,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-sm font-medium">+{achievement.xp} XP</span>
              {achievement.unlocked && achievement.unlockedAt && (
                <span className="text-white/30 text-xs">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Unlock indicator */}
        {achievement.unlocked && (
          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardItem({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser?: boolean }) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'text-yellow-400' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-300' };
    if (rank === 3) return { icon: '🥉', color: 'text-amber-600' };
    return { icon: `#${rank}`, color: 'text-white/50' };
  };

  const rankDisplay = getRankDisplay(entry.rank);

  return (
    <Link
      href={`/@${entry.username}`}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isCurrentUser ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      {/* Rank */}
      <div className={`w-8 text-center font-bold ${rankDisplay.color}`}>
        {entry.rank <= 3 ? rankDisplay.icon : rankDisplay.icon}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
        {entry.profilePicture ? (
          <img src={entry.profilePicture} alt={entry.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold">
            {entry.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-white font-medium truncate">{entry.username}</span>
          {entry.isVerified && (
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          )}
        </div>
        <span className="text-white/50 text-sm">Level {entry.level}</span>
      </div>

      {/* XP */}
      <div className="text-right">
        <div className="text-white font-medium">{entry.totalXp.toLocaleString()}</div>
        <div className="text-white/50 text-xs">XP</div>
      </div>
    </Link>
  );
}

function getAchievementIcon(iconName: string): string {
  const icons: Record<string, string> = {
    star: '⭐',
    video_camera: '🎥',
    fire: '🔥',
    heart: '❤️',
    eye: '👁️',
    users: '👥',
    mic: '🎤',
    trophy: '🏆',
    crown: '👑',
    rocket: '🚀',
    diamond: '💎',
    coin: '🪙',
    gift: '🎁',
    music: '🎵',
    chat: '💬',
    share: '📤',
    live: '📡',
    verified: '✓',
  };
  return icons[iconName] || '🏅';
}

type TabType = 'achievements' | 'leaderboard';

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('achievements');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userAchievements, leaderboardData] = await Promise.all([
        achievementsApi.getUserAchievements(),
        achievementsApi.getLeaderboard(),
      ]);
      setAchievements(userAchievements.achievements);
      setStats(userAchievements.stats || null);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  // Sort: unlocked first, then by tier
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return 0;
  });

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <TopNav />

      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-white mb-4">Achievements</h1>

        {/* Stats Header */}
        <StatsHeader stats={stats} />

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Achievements
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'achievements' ? (
          <>
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {ACHIEVEMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    selectedCategory === cat.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Achievements List */}
            {sortedAchievements.length > 0 ? (
              <div className="space-y-3">
                {sortedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">🏆</span>
                <p className="text-white/50">No achievements in this category</p>
              </div>
            )}
          </>
        ) : (
          /* Leaderboard */
          <div className="space-y-2">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry) => (
                <LeaderboardItem key={entry.userId} entry={entry} />
              ))
            ) : (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">📊</span>
                <p className="text-white/50">No leaderboard data yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

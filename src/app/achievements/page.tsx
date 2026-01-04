'use client';

import { useState, useEffect } from 'react';
import { TopNav } from '@/components/ui/TopNav';
import { BottomNav } from '@/components/ui/BottomNav';
import { achievementsApi } from '@/services/api/achievements';
import { StatsHeader, AchievementCard, LeaderboardItem } from '@/components/achievements';
import {
  ACHIEVEMENT_CATEGORIES,
  type Achievement,
  type AchievementStats,
  type AchievementCategory,
  type LeaderboardEntry,
} from '@/types/achievement';

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

  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return 0;
  });

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <TopNav />

      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-white mb-4">Achievements</h1>

        <StatsHeader stats={stats} />

        <div className="flex gap-2 mb-4">
          {(['achievements', 'leaderboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : activeTab === 'achievements' ? (
          <>
            <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
            <AchievementsList achievements={sortedAchievements} />
          </>
        ) : (
          <LeaderboardList entries={leaderboard} />
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function LoadingSkeleton() {
  return (
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
  );
}

function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: AchievementCategory;
  onSelect: (cat: AchievementCategory) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {ACHIEVEMENT_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            selected === cat.id
              ? 'bg-purple-500 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}

function AchievementsList({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl mb-4 block">🏆</span>
        <p className="text-white/50">No achievements in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
}

function LeaderboardList({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl mb-4 block">📊</span>
        <p className="text-white/50">No leaderboard data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <LeaderboardItem key={entry.userId} entry={entry} />
      ))}
    </div>
  );
}

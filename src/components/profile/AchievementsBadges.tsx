'use client';

import { useState, useEffect } from 'react';
import { achievementsApi } from '@/services/api/achievements';
import { TIER_COLORS, type Achievement, type AchievementStats } from '@/types/achievement';
import { logger } from '@/utils/logger';

interface AchievementsBadgesProps {
  compact?: boolean;
}

/**
 * Gap #64: Achievements/Badges System
 * Displays achievement categories with badge grid, locked/unlocked states, progress bars.
 */
export function AchievementsBadges({ compact = false }: AchievementsBadgesProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await achievementsApi.getUserAchievements();
      setAchievements(data.achievements || []);
      setStats(data.stats || null);
    } catch (err) {
      logger.error('Failed to load achievements:', err);
      setAchievements(generateFallbackAchievements());
    } finally {
      setLoading(false);
    }
  };

  const filtered = category === 'all' ? achievements : achievements.filter(a => a.category === category);
  const sorted = [...filtered].sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1));
  const displayed = compact ? sorted.slice(0, 6) : sorted;

  const categories = [
    { id: 'all', label: 'All', icon: '🏆' },
    { id: 'content', label: 'Creator', icon: '🎬' },
    { id: 'community', label: 'Social', icon: '👥' },
    { id: 'engagement', label: 'Explorer', icon: '💬' },
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 rounded-xl bg-white/5 animate-pulse h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Level progress */}
      {stats && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Level {stats.level}</span>
            <span className="text-white/40 text-xs">{stats.unlockedCount}/{stats.totalCount} unlocked</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full transition-all"
              style={{ width: `${stats.xpProgress}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-white/30 text-[10px]">{stats.currentLevelXp} XP</span>
            <span className="text-white/30 text-[10px]">{stats.nextLevelXp} XP</span>
          </div>
        </div>
      )}

      {/* Categories */}
      {!compact && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${
                category === c.id ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}>
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Badge grid */}
      <div className={`grid ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'} gap-3`}>
        {displayed.map(a => (
          <BadgeCard key={a.id} achievement={a} />
        ))}
      </div>

      {displayed.length === 0 && (
        <p className="text-white/40 text-sm text-center py-8">No achievements in this category</p>
      )}
    </div>
  );
}

function BadgeCard({ achievement }: { achievement: Achievement }) {
  const tierColor = TIER_COLORS[achievement.tier] || '#8B5CF6';
  const progress = achievement.progress;

  return (
    <div className={`glass rounded-xl p-3 text-center transition ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}`}>
      <div className="text-3xl mb-1" style={{ filter: achievement.unlocked ? 'none' : 'grayscale(1)' }}>
        {achievement.icon}
      </div>
      <h4 className="text-white text-xs font-medium truncate">{achievement.name}</h4>
      <div className="flex items-center justify-center gap-1 mt-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tierColor }} />
        <span className="text-[10px] capitalize" style={{ color: tierColor }}>{achievement.tier}</span>
      </div>
      {progress && !achievement.unlocked && (
        <div className="mt-2">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full"
              style={{ width: `${progress.percentage}%` }} />
          </div>
          <span className="text-[9px] text-white/30">{progress.current}/{progress.target}</span>
        </div>
      )}
      {achievement.unlocked && (
        <span className="text-[10px] text-green-400">+{achievement.xp} XP</span>
      )}
    </div>
  );
}

function generateFallbackAchievements(): Achievement[] {
  const milestones = [
    { name: 'First Video', icon: '🎬', cat: 'content', xp: 50, tier: 'bronze' as const },
    { name: '10 Videos', icon: '🎥', cat: 'content', xp: 200, tier: 'silver' as const },
    { name: '100 Likes', icon: '❤️', cat: 'engagement', xp: 100, tier: 'bronze' as const },
    { name: '1K Likes', icon: '💖', cat: 'engagement', xp: 500, tier: 'gold' as const },
    { name: '100 Followers', icon: '👥', cat: 'community', xp: 200, tier: 'silver' as const },
    { name: '1K Followers', icon: '🌟', cat: 'community', xp: 1000, tier: 'gold' as const },
    { name: 'First Live', icon: '📡', cat: 'content', xp: 150, tier: 'bronze' as const },
    { name: 'Viral Video', icon: '🔥', cat: 'engagement', xp: 2000, tier: 'diamond' as const },
    { name: 'Gift Giver', icon: '🎁', cat: 'community', xp: 100, tier: 'bronze' as const },
  ];
  return milestones.map((m, i) => ({
    id: `fallback-${i}`,
    name: m.name,
    description: `Unlock the ${m.name} achievement`,
    icon: m.icon,
    category: m.cat as Achievement['category'],
    xp: m.xp,
    tier: m.tier,
    unlocked: false,
    progress: { current: 0, target: 1, percentage: 0 },
  }));
}

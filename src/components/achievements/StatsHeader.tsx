'use client';

import type { AchievementStats } from '@/types/achievement';

interface StatsHeaderProps {
  stats: AchievementStats | null;
}

export function StatsHeader({ stats }: StatsHeaderProps) {
  if (!stats) return null;

  return (
    <div className="bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="36" fill="none" stroke="url(#levelGradient)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={`${stats.xpProgress * 2.26} 226`}
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

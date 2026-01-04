'use client';

import type { Achievement } from '@/types/achievement';
import { getAchievementIcon, getTierColor } from './achievementUtils';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const tierColor = getTierColor(achievement.tier);

  return (
    <div
      className={`p-4 rounded-xl transition-all ${
        achievement.unlocked
          ? 'bg-white/10 border border-white/10'
          : 'bg-white/5 border border-white/5 opacity-70'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            achievement.unlocked ? '' : 'grayscale opacity-50'
          }`}
          style={{ backgroundColor: `${tierColor}20` }}
        >
          {getAchievementIcon(achievement.icon)}
        </div>

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
                  style={{ width: `${achievement.progress.percentage}%`, backgroundColor: tierColor }}
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

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { achievementsApi } from '@/services/api/achievements';
import type { Achievement } from '@/types/achievement';

const TIER_COLORS: Record<string, string> = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-yellow-300',
  diamond: 'from-blue-400 to-purple-400',
};

const ICON_MAP: Record<string, string> = {
  video_camera: '📹', camera: '📷', heart: '❤️', star: '⭐', trophy: '🏆',
  fire: '🔥', crown: '👑', rocket: '🚀', lightning: '⚡', music: '🎵',
  chat: '💬', share: '🔗', eye: '👁️', gift: '🎁', money: '💰',
};

interface BadgesTabProps {
  selectedBadges: string[];
  toggleBadge: (badgeId: string) => void;
}

export function BadgesTab({ selectedBadges, toggleBadge }: BadgesTabProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await achievementsApi.getUserAchievements();
      setAchievements(result.achievements || []);
      setLoading(false);
    };
    load();
  }, []);

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <motion.div
      key="badges"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <p className="text-white/50 text-sm">Select up to 3 badges to display on your profile</p>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-3">🏆</div>
          <p className="text-white/40 text-sm">No badges earned yet</p>
          <p className="text-white/30 text-xs mt-1">Earn badges by engaging with the community</p>
        </div>
      ) : (
        <>
          {unlocked.length > 0 && (
            <div>
              <h4 className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2">
                Unlocked ({unlocked.length})
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {unlocked.map((badge) => {
                  const isSelected = selectedBadges.includes(badge.id);
                  return (
                    <button
                      key={badge.id}
                      onClick={() => toggleBadge(badge.id)}
                      className={`relative p-3 rounded-xl text-center transition-all ${
                        isSelected
                          ? 'bg-purple-500/20 border-2 border-purple-500'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px]">✓</span>
                        </div>
                      )}
                      <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${TIER_COLORS[badge.tier] || TIER_COLORS.bronze} flex items-center justify-center text-lg mb-1`}>
                        {ICON_MAP[badge.icon] || '🏅'}
                      </div>
                      <div className="text-white text-xs font-medium truncate">{badge.name}</div>
                      <div className="text-white/30 text-[10px]">{badge.xp} XP</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {locked.length > 0 && (
            <div>
              <h4 className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2">
                Locked ({locked.length})
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {locked.map((badge) => (
                  <div key={badge.id} className="p-3 rounded-xl text-center bg-white/5 opacity-50">
                    <div className="w-10 h-10 mx-auto rounded-full bg-white/10 flex items-center justify-center text-lg mb-1">
                      🔒
                    </div>
                    <div className="text-white/50 text-xs font-medium truncate">{badge.name}</div>
                    {badge.progress && (
                      <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${badge.progress.percentage}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

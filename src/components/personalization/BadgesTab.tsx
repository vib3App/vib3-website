'use client';

import { motion } from 'framer-motion';
import { MOCK_BADGES, RARITY_COLORS } from './ProfileCustomizerTypes';

interface BadgesTabProps {
  selectedBadges: string[];
  toggleBadge: (badgeId: string) => void;
}

export function BadgesTab({ selectedBadges, toggleBadge }: BadgesTabProps) {
  return (
    <motion.div
      key="badges"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <p className="text-white/50 text-sm">Select up to 3 badges to display</p>

      <div className="grid grid-cols-2 gap-3">
        {MOCK_BADGES.map((badge) => (
          <motion.button
            key={badge.id}
            className={`p-3 rounded-xl border-2 transition-colors ${
              selectedBadges.includes(badge.id)
                ? `${RARITY_COLORS[badge.rarity]} bg-white/10`
                : 'border-transparent bg-white/5 hover:bg-white/10'
            }`}
            onClick={() => toggleBadge(badge.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: badge.color + '30' }}
              >
                {badge.icon}
              </span>
              <div className="text-left">
                <div className="text-white text-sm">{badge.name}</div>
                <div className="text-white/40 text-xs capitalize">{badge.rarity}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

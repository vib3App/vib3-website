'use client';

import { motion } from 'framer-motion';

interface BadgesTabProps {
  selectedBadges: string[];
  toggleBadge: (badgeId: string) => void;
}

export function BadgesTab({ }: BadgesTabProps) {
  return (
    <motion.div
      key="badges"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <p className="text-white/50 text-sm">Select up to 3 badges to display</p>

      <div className="text-center py-8">
        <div className="text-3xl mb-3">🏆</div>
        <p className="text-white/40 text-sm">
          Badges coming soon
        </p>
        <p className="text-white/30 text-xs mt-1">
          Earn badges by engaging with the community
        </p>
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';

interface TrendPredictionProps {
  className?: string;
  limit?: number;
}

/**
 * AI-powered trend prediction panel
 */
export function TrendPrediction({ className = '' }: TrendPredictionProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">Trending Soon</h3>
          <p className="text-white/50 text-sm">AI-predicted rising trends</p>
        </div>
        <div className="flex items-center gap-1 text-purple-400/50 text-sm">
          <span className="w-2 h-2 rounded-full bg-purple-400/50" />
          Coming Soon
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl text-center">
        <p className="text-white/40 text-sm">
          AI trend predictions coming soon
        </p>
      </div>
    </div>
  );
}

/**
 * Mini trend badge for video cards
 */
export function TrendBadge() {
  return (
    <motion.div
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                 bg-purple-500/30 border border-purple-500/50 text-purple-300 text-xs"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <span>🔮</span>
      <span>Trending</span>
    </motion.div>
  );
}

export default TrendPrediction;

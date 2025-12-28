'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TrendItem {
  id: string;
  name: string;
  category: 'sound' | 'effect' | 'hashtag' | 'challenge';
  growthRate: number; // Percentage growth
  predictedPeak: string; // When it will peak
  confidence: number; // AI confidence 0-1
  icon: string;
}

// Simulated trend predictions
const mockTrends: TrendItem[] = [
  {
    id: '1',
    name: 'Crystal Glitch',
    category: 'effect',
    growthRate: 340,
    predictedPeak: '2 days',
    confidence: 0.92,
    icon: '💎',
  },
  {
    id: '2',
    name: '#NeonVibes',
    category: 'hashtag',
    growthRate: 180,
    predictedPeak: '5 days',
    confidence: 0.85,
    icon: '🌈',
  },
  {
    id: '3',
    name: 'Bass Drop Beat',
    category: 'sound',
    growthRate: 520,
    predictedPeak: '1 day',
    confidence: 0.95,
    icon: '🎵',
  },
  {
    id: '4',
    name: 'Mirror Dance',
    category: 'challenge',
    growthRate: 280,
    predictedPeak: '3 days',
    confidence: 0.78,
    icon: '🪞',
  },
];

interface TrendCardProps {
  trend: TrendItem;
  index: number;
}

/**
 * Individual trend prediction card
 */
function TrendCard({ trend, index }: TrendCardProps) {
  const categoryColors = {
    sound: 'from-purple-500 to-pink-500',
    effect: 'from-cyan-500 to-blue-500',
    hashtag: 'from-green-500 to-emerald-500',
    challenge: 'from-orange-500 to-red-500',
  };

  const categoryLabels = {
    sound: 'Sound',
    effect: 'Effect',
    hashtag: 'Hashtag',
    challenge: 'Challenge',
  };

  return (
    <motion.div
      className="glass-card p-4 rounded-xl relative overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${categoryColors[trend.category]} opacity-10`}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{trend.icon}</span>
            <div>
              <div className="text-white font-medium">{trend.name}</div>
              <div className="text-white/50 text-xs">
                {categoryLabels[trend.category]}
              </div>
            </div>
          </div>
          <motion.div
            className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${categoryColors[trend.category]} text-white`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            +{trend.growthRate}%
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-white/40 text-xs">Peak in</div>
            <div className="text-white">{trend.predictedPeak}</div>
          </div>
          <div>
            <div className="text-white/40 text-xs">Confidence</div>
            <div className="flex items-center gap-1">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${categoryColors[trend.category]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${trend.confidence * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                />
              </div>
              <span className="text-white/60 text-xs">
                {Math.round(trend.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface TrendPredictionProps {
  className?: string;
  limit?: number;
}

/**
 * AI-powered trend prediction panel
 */
export function TrendPrediction({ className = '', limit = 4 }: TrendPredictionProps) {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setTrends(mockTrends.slice(0, limit));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [limit]);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(limit)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">Trending Soon</h3>
          <p className="text-white/50 text-sm">AI-predicted rising trends</p>
        </div>
        <motion.div
          className="flex items-center gap-1 text-purple-400 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          Live predictions
        </motion.div>
      </div>

      {trends.map((trend, index) => (
        <TrendCard key={trend.id} trend={trend} index={index} />
      ))}
    </div>
  );
}

/**
 * Mini trend badge for video cards
 */
export function TrendBadge({ trend }: { trend: TrendItem }) {
  return (
    <motion.div
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                 bg-purple-500/30 border border-purple-500/50 text-purple-300 text-xs"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <span>🔮</span>
      <span>Trending +{trend.growthRate}%</span>
    </motion.div>
  );
}

export default TrendPrediction;

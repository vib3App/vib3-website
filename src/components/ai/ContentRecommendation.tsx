'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface RecommendationReason {
  type: 'liked' | 'watched' | 'followed' | 'trending' | 'similar' | 'personalized';
  detail: string;
}

interface ContentRecommendation {
  id: string;
  thumbnail: string;
  title: string;
  creator: string;
  views: number;
  matchScore: number; // 0-100 how well it matches user
  reason: RecommendationReason;
}

const reasonIcons: Record<RecommendationReason['type'], string> = {
  liked: '❤️',
  watched: '👀',
  followed: '👤',
  trending: '🔥',
  similar: '🔗',
  personalized: '✨',
};

const reasonLabels: Record<RecommendationReason['type'], string> = {
  liked: 'Because you liked',
  watched: 'Similar to what you watch',
  followed: 'From creators you follow',
  trending: 'Trending in your area',
  similar: 'Similar content',
  personalized: 'Made for you',
};

interface RecommendationCardProps {
  recommendation: ContentRecommendation;
  index: number;
}

/**
 * Individual recommendation card with AI explanation
 */
function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  const [showReason, setShowReason] = useState(false);

  return (
    <motion.div
      className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setShowReason(true)}
      onHoverEnd={() => setShowReason(false)}
    >
      {/* Thumbnail placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />

      {/* Match score ring */}
      <div className="absolute top-2 right-2">
        <div className="relative w-10 h-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="3"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="url(#matchGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${recommendation.matchScore}, 100`}
              initial={{ strokeDasharray: '0, 100' }}
              animate={{ strokeDasharray: `${recommendation.matchScore}, 100` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
            />
            <defs>
              <linearGradient id="matchGradient">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {recommendation.matchScore}
            </span>
          </div>
        </div>
      </div>

      {/* Info overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div className="text-white text-sm font-medium truncate">
          {recommendation.title}
        </div>
        <div className="text-white/60 text-xs">{recommendation.creator}</div>
      </div>

      {/* AI reason tooltip */}
      <AnimatePresence>
        {showReason && (
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.span
              className="text-3xl mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {reasonIcons[recommendation.reason.type]}
            </motion.span>
            <div className="text-white text-sm text-center font-medium">
              {reasonLabels[recommendation.reason.type]}
            </div>
            <div className="text-white/60 text-xs text-center mt-1">
              {recommendation.reason.detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ContentRecommendationsProps {
  className?: string;
}

/**
 * AI-powered content recommendations grid
 */
export function ContentRecommendations({ className = '' }: ContentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading recommendations
    const timer = setTimeout(() => {
      setRecommendations([
        {
          id: '1',
          thumbnail: '',
          title: 'Epic Dance Moves 🔥',
          creator: '@dancemaster',
          views: 1200000,
          matchScore: 95,
          reason: { type: 'personalized', detail: 'Based on your preferences' },
        },
        {
          id: '2',
          thumbnail: '',
          title: 'Cooking Secrets',
          creator: '@chefmike',
          views: 500000,
          matchScore: 88,
          reason: { type: 'liked', detail: 'Similar to videos you liked' },
        },
        {
          id: '3',
          thumbnail: '',
          title: 'Travel Vlog Tokyo',
          creator: '@wanderlust',
          views: 890000,
          matchScore: 82,
          reason: { type: 'followed', detail: 'From a creator you follow' },
        },
        {
          id: '4',
          thumbnail: '',
          title: 'Tech Review 2024',
          creator: '@techguru',
          views: 340000,
          matchScore: 76,
          reason: { type: 'trending', detail: 'Popular in your area' },
        },
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="aspect-[9/16] rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">For You</h3>
          <p className="text-white/50 text-sm">AI-curated recommendations</p>
        </div>
        <motion.button
          className="text-purple-400 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          See all
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {recommendations.map((rec, index) => (
          <RecommendationCard key={rec.id} recommendation={rec} index={index} />
        ))}
      </div>
    </div>
  );
}

/**
 * "Why this video?" explanation component
 */
export function WhyThisVideo({ reason }: { reason: RecommendationReason }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-1 text-white/50 text-xs hover:text-white/70"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
      >
        <span>🤖</span>
        <span>Why this?</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-full left-0 mb-2 p-3 rounded-lg
                       bg-black/90 backdrop-blur-xl border border-white/10
                       w-48 z-50"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{reasonIcons[reason.type]}</span>
              <span className="text-white text-sm font-medium">
                {reasonLabels[reason.type]}
              </span>
            </div>
            <p className="text-white/60 text-xs">{reason.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ContentRecommendations;

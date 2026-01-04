'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface HashtagSuggestion {
  tag: string;
  reach: number;
  competition: 'low' | 'medium' | 'high';
  trending: boolean;
}

const MOCK_HASHTAGS: HashtagSuggestion[] = [
  { tag: 'fyp', reach: 50000000000, competition: 'high', trending: true },
  { tag: 'viral', reach: 10000000000, competition: 'high', trending: true },
  { tag: 'vib3', reach: 500000, competition: 'low', trending: true },
  { tag: 'contentcreator', reach: 5000000000, competition: 'medium', trending: false },
  { tag: 'trending', reach: 8000000000, competition: 'high', trending: true },
  { tag: 'foryou', reach: 30000000000, competition: 'high', trending: false },
];

const COMPETITION_COLORS: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

function formatReach(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(0)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

export function HashtagSuggestions({ className = '' }: { className?: string }) {
  const [hashtags, setHashtags] = useState<HashtagSuggestion[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setHashtags(MOCK_HASHTAGS);
  }, []);

  const toggleHashtag = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <motion.div
      className={`glass-card p-4 rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">Smart Hashtags</h3>
          <p className="text-white/50 text-sm">AI-recommended for reach</p>
        </div>
        <div className="text-2xl">#️⃣</div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {hashtags.map((hashtag, index) => (
          <motion.button
            key={hashtag.tag}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              selected.includes(hashtag.tag)
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => toggleHashtag(hashtag.tag)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            #{hashtag.tag}
            {hashtag.trending && (
              <span className="ml-1">🔥</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Selected hashtags info */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            className="p-3 rounded-xl bg-white/5 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="text-white/60 text-xs">Selected: {selected.length} hashtags</div>
            {selected.map((tag) => {
              const hashtag = hashtags.find((h) => h.tag === tag);
              if (!hashtag) return null;
              return (
                <div key={tag} className="flex items-center justify-between text-xs">
                  <span className="text-white">#{tag}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white/50">{formatReach(hashtag.reach)} reach</span>
                    <span className={COMPETITION_COLORS[hashtag.competition]}>
                      {hashtag.competition}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default HashtagSuggestions;

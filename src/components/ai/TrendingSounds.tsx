'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface TrendingSound {
  id: string;
  name: string;
  artist: string;
  uses: number;
  growth: number;
  preview?: string;
}

const MOCK_SOUNDS: TrendingSound[] = [
  { id: '1', name: 'Summer Vibes', artist: 'DJ Sun', uses: 1250000, growth: 85 },
  { id: '2', name: 'Electric Dreams', artist: 'Synth Wave', uses: 890000, growth: 120 },
  { id: '3', name: 'Chill Lo-Fi', artist: 'Beats Lab', uses: 2100000, growth: 45 },
  { id: '4', name: 'Bass Drop', artist: 'Heavy Beats', uses: 560000, growth: 200 },
];

function formatUses(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

export function TrendingSounds({ className = '' }: { className?: string }) {
  const [sounds, setSounds] = useState<TrendingSound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSounds(MOCK_SOUNDS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`glass-card p-4 rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">Trending Sounds</h3>
          <p className="text-white/50 text-sm">Popular audio for your content</p>
        </div>
        <div className="text-2xl">🎵</div>
      </div>

      <div className="space-y-2">
        {sounds.map((sound, index) => (
          <motion.div
            key={sound.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5
                       hover:bg-white/10 transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500
                         flex items-center justify-center"
              whileHover={{ rotate: [0, -10, 10, 0] }}
            >
              <span>🎧</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {sound.name}
              </div>
              <div className="text-white/50 text-xs">{sound.artist}</div>
            </div>
            <div className="text-right">
              <div className="text-white/60 text-xs">{formatUses(sound.uses)} uses</div>
              <div className="text-green-400 text-xs">+{sound.growth}%</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default TrendingSounds;

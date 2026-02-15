'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { soundsApi } from '@/services/api/sounds';
import type { MusicTrack } from '@/types/sound';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function TrendingSounds({ className = '' }: { className?: string }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await soundsApi.getTrending(1, 5);
      setTracks(result.data);
      setLoading(false);
    };
    load();
  }, []);

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

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-white/40 text-sm">No trending sounds yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tracks.map((track, i) => (
            <div key={track.id || track._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{track.title}</div>
                <div className="text-white/40 text-xs truncate">{track.artist}</div>
              </div>
              <div className="text-white/30 text-xs flex-shrink-0">
                {track.plays > 0 && <span>{formatCount(track.plays)}</span>}
                {track.duration > 0 && <span className="ml-2">{formatDuration(track.duration)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default TrendingSounds;

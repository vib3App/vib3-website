'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { feedApi } from '@/services/api';
import type { Video } from '@/types';

interface TrendPredictionProps {
  className?: string;
  limit?: number;
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

/**
 * Trending predictions panel — shows rising trending videos
 * based on backend's pre-computed trendingScore algorithm
 */
export function TrendPrediction({ className = '', limit = 5 }: TrendPredictionProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await feedApi.getTrendingFeed(1, limit);
        setVideos(result.items || []);
      } catch {
        // silent
      }
      setLoading(false);
    };
    load();
  }, [limit]);

  // Extract trending hashtags from the videos
  const trendingTags: string[] = [];
  videos.forEach(v => {
    v.hashtags?.forEach(tag => {
      if (!trendingTags.includes(tag) && trendingTags.length < 5) {
        trendingTags.push(tag);
      }
    });
  });

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">Trending Now</h3>
          <p className="text-white/50 text-sm">Rising content on the platform</p>
        </div>
        <div className="flex items-center gap-1 text-purple-400 text-sm">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          Live
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="glass-card p-6 rounded-xl text-center">
          <p className="text-white/40 text-sm">No trending data available</p>
        </div>
      ) : (
        <>
          {trendingTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {trendingTags.map(tag => (
                <TrendBadge key={tag} label={`#${tag}`} />
              ))}
            </div>
          )}
          <div className="space-y-2">
            {videos.map((video, i) => (
              <a
                key={video.id}
                href={`/feed?video=${video.id}`}
                className="flex items-center gap-3 p-3 glass-card rounded-xl hover:bg-white/10 transition"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {video.caption || video.title || 'Untitled'}
                  </div>
                  <div className="text-white/40 text-xs">
                    @{video.username || 'user'} · {formatCount(video.viewsCount || 0)} views
                  </div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Mini trend badge for hashtags and video cards
 */
export function TrendBadge({ label = 'Trending' }: { label?: string }) {
  return (
    <motion.div
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                 bg-purple-500/30 border border-purple-500/50 text-purple-300 text-xs"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <span>🔮</span>
      <span>{label}</span>
    </motion.div>
  );
}

export default TrendPrediction;

'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { feedApi } from '@/services/api/feed';
import type { Video } from '@/types';
import { logger } from '@/utils/logger';

export type FeedSource = 'foryou' | 'following' | 'trending' | 'discover';

const SOURCE_LABELS: Record<FeedSource, string> = {
  foryou: 'For You',
  following: 'Following',
  trending: 'Trending',
  discover: 'Discover',
};

interface FeedSlotProps {
  source: FeedSource;
  masterMuted: boolean;
  isPlaying: boolean;
  onChangeSource: (next: FeedSource) => void;
  onTogglePlay: () => void;
}

async function fetchSource(source: FeedSource): Promise<Video[]> {
  try {
    let resp;
    switch (source) {
      case 'foryou': resp = await feedApi.getForYouFeed(1, 12); break;
      case 'following': resp = await feedApi.getFollowingFeed(1, 12); break;
      case 'trending': resp = await feedApi.getTrendingFeed(1, 12); break;
      case 'discover': resp = await feedApi.getDiscoverFeed(1, 12); break;
    }
    return resp.items;
  } catch (err) {
    logger.error(`FeedSlot fetch (${source}) failed:`, err);
    return [];
  }
}

export function FeedSlot({ source, masterMuted, isPlaying, onChangeSource, onTogglePlay }: FeedSlotProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Reload feed when source changes. setLoading happens AFTER await so the
  // call isn't synchronously in the effect body (avoids the lint warning).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const items = await fetchSource(source);
      if (cancelled) return;
      setVideos(items);
      setIndex(0);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [source]);


  // Attach HLS when current video changes.
  const current = videos[index] ?? null;
  const currentUrl = current?.videoUrl ?? '';
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !currentUrl) return;
    hlsRef.current?.destroy();
    hlsRef.current = null;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(currentUrl);
      hls.attachMedia(el);
      hlsRef.current = hls;
    } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = currentUrl;
    }
    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [currentUrl]);

  // Sync play/mute state to the element.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = masterMuted;
    if (isPlaying) el.play().catch(() => {});
    else el.pause();
  }, [isPlaying, masterMuted]);

  const next = () => setIndex(i => Math.min(i + 1, videos.length - 1));
  const prev = () => setIndex(i => Math.max(0, i - 1));

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {current && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay={isPlaying}
          loop
          playsInline
          muted={masterMuted}
          onEnded={next}
          onClick={onTogglePlay}
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs px-4 text-center">
          No videos in {SOURCE_LABELS[source]}
        </div>
      )}

      {/* Source picker chip */}
      <div className="absolute top-2 left-2 z-10">
        <button
          type="button"
          onClick={() => setShowSourcePicker(s => !s)}
          className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur text-white text-xs font-medium border border-white/10"
        >
          {SOURCE_LABELS[source]} ▾
        </button>
        {showSourcePicker && (
          <div className="absolute top-full mt-1 left-0 bg-zinc-900/95 backdrop-blur rounded-lg border border-white/10 overflow-hidden">
            {(Object.keys(SOURCE_LABELS) as FeedSource[]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { onChangeSource(s); setShowSourcePicker(false); }}
                className={`block w-full text-left px-3 py-1.5 text-xs whitespace-nowrap ${
                  s === source ? 'bg-purple-500/30 text-white' : 'text-white/70 hover:bg-white/5'
                }`}
              >
                {SOURCE_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Caption */}
      {current && (
        <div className="absolute bottom-2 left-2 right-12 z-10 text-white text-xs">
          <p className="font-medium">@{current.username}</p>
          {current.caption && (
            <p className="text-white/70 truncate">{current.caption}</p>
          )}
        </div>
      )}

      {/* Prev/Next within this slot */}
      {videos.length > 1 && (
        <div className="absolute right-1 bottom-2 top-2 flex flex-col items-center justify-between z-10">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white text-sm disabled:opacity-30"
            aria-label="Previous"
          >
            ↑
          </button>
          <span className="text-[10px] text-white/60">{index + 1}/{videos.length}</span>
          <button
            type="button"
            onClick={next}
            disabled={index >= videos.length - 1}
            className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white text-sm disabled:opacity-30"
            aria-label="Next"
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { BottomNav } from '@/components/ui/BottomNav';
import { soundsApi } from '@/services/api/sounds';
import { MUSIC_CATEGORIES, type MusicTrack, type MusicCategory } from '@/types/sound';
import { logger } from '@/utils/logger';

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

function TrackCard({ track, onPlay, isPlaying }: { track: MusicTrack; onPlay: () => void; isPlaying: boolean }) {
  const router = useRouter();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={() => router.push(`/sounds/${track.id}`)}
    >
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
        {track.coverUrl ? (
          <Image src={track.coverUrl} alt={track.title} width={56} height={56} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MusicIcon className="w-6 h-6 text-white" />
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
        >
          {isPlaying ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate">{track.title}</h3>
        <p className="text-white/50 text-sm truncate">{track.artist}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
          <span>{formatDuration(track.duration)}</span>
          {track.plays > 0 && (
            <>
              <span>•</span>
              <span>{track.plays.toLocaleString()} plays</span>
            </>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/camera?sound=${track.id}`);
        }}
        className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-full hover:bg-purple-600 transition-colors"
      >
        Use
      </button>
    </div>
  );
}

export default function SoundsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MusicCategory>('Trending');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio] = useState(() => typeof Audio !== 'undefined' ? new Audio() : null);

  const loadTracks = useCallback(async () => {
    setIsLoading(true);
    try {
      if (searchQuery.trim()) {
        const result = await soundsApi.searchMusic(searchQuery);
        setTracks(result.data);
      } else if (selectedCategory === 'Trending') {
        const result = await soundsApi.getTrending();
        setTracks(result.data);
      } else {
        const result = await soundsApi.getByCategory(selectedCategory);
        setTracks(result.data);
      }
    } catch (error) {
      logger.error('Failed to load tracks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const debounce = setTimeout(loadTracks, searchQuery ? 500 : 0);
    return () => clearTimeout(debounce);
  }, [loadTracks, searchQuery]);

  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  const handlePlay = (track: MusicTrack) => {
    if (!audio) return;

    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.src = track.previewUrl || track.audioUrl;
      audio.play().catch(console.error);
      setPlayingId(track.id);

      // Stop after 15 seconds
      setTimeout(() => {
        if (playingId === track.id) {
          audio.pause();
          setPlayingId(null);
        }
      }, 15000);
    }
  };

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <TopNav />

      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-white mb-4">Sounds</h1>

        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sounds..."
            className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {MUSIC_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category && !searchQuery
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tracks List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 animate-pulse">
                <div className="w-14 h-14 rounded-lg bg-white/10" />
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : tracks.length > 0 ? (
          <div className="space-y-2">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={() => handlePlay(track)}
                isPlaying={playingId === track.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MusicIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">
              {searchQuery ? 'No sounds found' : 'No sounds in this category'}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

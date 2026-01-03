'use client';

import { useState, useEffect, useCallback } from 'react';
import { soundsApi } from '@/services/api/sounds';
import { MUSIC_CATEGORIES, type MusicTrack, type MusicCategory } from '@/types/sound';

interface SoundPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (track: MusicTrack) => void;
  selectedTrackId?: string;
}

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

export function SoundPicker({ isOpen, onClose, onSelect, selectedTrackId }: SoundPickerProps) {
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
      console.error('Failed to load tracks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (!isOpen) return;
    const debounce = setTimeout(loadTracks, searchQuery ? 500 : 0);
    return () => clearTimeout(debounce);
  }, [loadTracks, searchQuery, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      audio?.pause();
      setPlayingId(null);
    }
  }, [isOpen, audio]);

  const handlePlay = (track: MusicTrack) => {
    if (!audio) return;

    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.src = track.previewUrl || track.audioUrl;
      audio.play().catch(console.error);
      setPlayingId(track.id);

      setTimeout(() => {
        if (playingId === track.id) {
          audio.pause();
          setPlayingId(null);
        }
      }, 15000);
    }
  };

  const handleSelect = (track: MusicTrack) => {
    audio?.pause();
    setPlayingId(null);
    onSelect(track);
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="bg-[#1a1a2e] w-full max-h-[85vh] rounded-t-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-white font-semibold">Add Sound</h2>
          <div className="w-6" />
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
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
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {MUSIC_CATEGORIES.slice(0, 10).map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
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
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 animate-pulse">
                  <div className="w-12 h-12 rounded-lg bg-white/10" />
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
                <div
                  key={track.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                    selectedTrackId === track.id
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => handleSelect(track)}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
                    {track.coverUrl ? (
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MusicIcon className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(track);
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      {playingId === track.id ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate text-sm">{track.title}</h3>
                    <p className="text-white/50 text-xs truncate">{track.artist}</p>
                  </div>

                  <span className="text-white/40 text-xs">{formatDuration(track.duration)}</span>

                  {selectedTrackId === track.id && (
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MusicIcon className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">
                {searchQuery ? 'No sounds found' : 'No sounds available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

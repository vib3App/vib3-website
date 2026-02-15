'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { soundsApi } from '@/services/api/sounds';
import type { MusicTrack } from '@/types/sound';

interface AudioPanelProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  selectedMusic?: MusicTrack | null;
  onMusicSelect?: (track: MusicTrack | null) => void;
  musicVolume?: number;
  onMusicVolumeChange?: (volume: number) => void;
}

export function AudioPanel({
  volume, onVolumeChange, selectedMusic, onMusicSelect, musicVolume = 0.5, onMusicVolumeChange,
}: AudioPanelProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const searchTracks = useCallback(async (q: string) => {
    setIsLoading(true);
    try {
      const result = q.trim()
        ? await soundsApi.searchMusic(q)
        : await soundsApi.getTrending();
      setTracks(result.data);
    } catch { setTracks([]); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    if (showPicker && tracks.length === 0) searchTracks('');
  }, [showPicker, tracks.length, searchTracks]);

  const togglePreview = useCallback((track: MusicTrack) => {
    if (previewingId === track.id) {
      audioRef.current?.pause();
      setPreviewingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(track.previewUrl || track.audioUrl);
    audio.volume = 0.5;
    audio.play().catch(() => {});
    audio.onended = () => setPreviewingId(null);
    audioRef.current = audio;
    setPreviewingId(track.id);
  }, [previewingId]);

  const selectTrack = useCallback((track: MusicTrack) => {
    audioRef.current?.pause();
    setPreviewingId(null);
    onMusicSelect?.(track);
    setShowPicker(false);
  }, [onMusicSelect]);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center justify-between text-white mb-2">
          <span>Original Volume</span>
          <span>{Math.round(volume * 100)}%</span>
        </label>
        <input type="range" min="0" max="1" step="0.01" value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))} className="w-full accent-purple-500" />
      </div>

      {selectedMusic ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 aurora-bg rounded-xl">
            {selectedMusic.coverUrl && (
              <img src={selectedMusic.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{selectedMusic.title}</p>
              <p className="text-white/50 text-xs truncate">{selectedMusic.artist}</p>
            </div>
            <button onClick={() => onMusicSelect?.(null)} className="text-white/40 hover:text-red-400 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div>
            <label className="flex items-center justify-between text-white mb-2">
              <span>Music Volume</span>
              <span>{Math.round(musicVolume * 100)}%</span>
            </label>
            <input type="range" min="0" max="1" step="0.01" value={musicVolume}
              onChange={(e) => onMusicVolumeChange?.(parseFloat(e.target.value))} className="w-full accent-teal-400" />
          </div>
        </div>
      ) : showPicker ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchTracks(query)}
              placeholder="Search music..." className="flex-1 aurora-bg text-white px-3 py-2 rounded-lg text-sm outline-none placeholder:text-white/30" autoFocus />
            <button onClick={() => searchTracks(query)} className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm">Search</button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-hide">
            {isLoading ? (
              <div className="text-center py-4 text-white/40 text-sm">Loading...</div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-4 text-white/40 text-sm">No tracks found</div>
            ) : tracks.map((track) => (
              <div key={track.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 group">
                <button onClick={() => togglePreview(track)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  {previewingId === track.id ? (
                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                  ) : (
                    <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{track.title}</p>
                  <p className="text-white/40 text-xs truncate">{track.artist}</p>
                </div>
                <button onClick={() => selectTrack(track)}
                  className="text-sm text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity px-2">Use</button>
              </div>
            ))}
          </div>
          <button onClick={() => setShowPicker(false)} className="w-full text-center text-white/40 text-sm py-1">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setShowPicker(true)}
          className="w-full py-3 border border-dashed border-white/20 text-white/50 rounded-xl hover:border-white/40">
          + Add Music
        </button>
      )}
    </div>
  );
}

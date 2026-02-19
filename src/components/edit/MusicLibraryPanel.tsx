'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { musicApiService, type MusicApiTrack } from '@/services/musicApi';
import { OfflineTracksTab } from './OfflineTracksTab';

interface MusicLibraryPanelProps {
  onSelectTrack: (track: { id: string; title: string; artist: string; url: string; duration: number; attribution?: string }) => void;
  currentTrackId: string | null;
}

type TabId = 'trending' | 'genres' | 'mood' | 'ai' | 'offline';

const GENRES = ['Pop', 'Hip Hop', 'Electronic', 'Rock', 'Chill', 'Jazz', 'Classical', 'Ambient'] as const;
const MOODS = ['Happy', 'Sad', 'Energetic', 'Calm', 'Dark', 'Romantic'] as const;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MusicLibraryPanel({ onSelectTrack, currentTrackId }: MusicLibraryPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<MusicApiTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApi, setHasApi] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setHasApi(musicApiService.hasRealApi());
    loadTrending();
    return () => { audioRef.current?.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTrending = async () => {
    setIsLoading(true);
    try {
      const results = await musicApiService.getTrending();
      setTracks(results);
    } catch { /* fallback handled in service */ }
    finally { setIsLoading(false); }
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) { loadTrending(); return; }
    setIsLoading(true);
    try {
      const results = await musicApiService.search(query);
      setTracks(results);
    } catch { /* handled */ }
    finally { setIsLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => handleSearch(value), 400);
  }, [handleSearch]);

  const togglePreview = useCallback((track: MusicApiTrack) => {
    if (previewingId === track.id) {
      audioRef.current?.pause();
      setPreviewingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(track.previewUrl || track.url);
    audio.volume = 0.5;
    audio.play().catch(() => {});
    audio.onended = () => setPreviewingId(null);
    audioRef.current = audio;
    setPreviewingId(track.id);
  }, [previewingId]);

  const handleSelect = useCallback((track: MusicApiTrack) => {
    audioRef.current?.pause();
    setPreviewingId(null);
    onSelectTrack({
      id: track.id, title: track.title, artist: track.artist,
      url: track.url, duration: track.duration, attribution: track.attribution,
    });
  }, [onSelectTrack]);

  const getFilteredTracks = (): MusicApiTrack[] => {
    let filtered = tracks;
    if (activeTab === 'genres' && selectedGenre) {
      const g = selectedGenre.toLowerCase();
      filtered = filtered.filter(t =>
        t.genre.toLowerCase() === g ||
        t.tags.some(tag => tag.toLowerCase().includes(g))
      );
    }
    if (activeTab === 'mood' && selectedMood) {
      const m = selectedMood.toLowerCase();
      filtered = filtered.filter(t => t.tags.some(tag => tag.toLowerCase().includes(m)));
    }
    if (activeTab === 'ai') return filtered.slice(0, 3);
    return filtered;
  };

  const filteredTracks = getFilteredTracks();
  const tabs: { id: TabId; label: string }[] = [
    { id: 'trending', label: 'Trending' },
    { id: 'genres', label: 'Genres' },
    { id: 'mood', label: 'Mood' },
    { id: 'ai', label: 'AI Suggested' },
    { id: 'offline', label: 'Offline' },
  ];

  return (
    <div className="space-y-3">
      {hasApi && <p className="text-teal-400/60 text-xs">Live music from Pixabay & Jamendo</p>}
      <input type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search royalty-free music..."
        className="w-full aurora-bg text-white px-3 py-2 rounded-lg text-sm outline-none placeholder:text-white/30" />
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedGenre(null); setSelectedMood(null); }}
            className={`flex-1 py-1.5 text-xs rounded-lg transition ${
              activeTab === tab.id ? 'bg-purple-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}>{tab.label}</button>
        ))}
      </div>
      {activeTab === 'genres' && (
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((genre) => (
            <button key={genre} onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              className={`px-2.5 py-1 text-xs rounded-full transition ${selectedGenre === genre ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'}`}
            >{genre}</button>
          ))}
        </div>
      )}
      {activeTab === 'mood' && (
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map((mood) => (
            <button key={mood} onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
              className={`px-2.5 py-1 text-xs rounded-full transition ${selectedMood === mood ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'}`}
            >{mood}</button>
          ))}
        </div>
      )}
      {activeTab === 'ai' && <p className="text-white/50 text-xs italic">Based on your video, we recommend:</p>}
      {activeTab === 'offline' && (
        <OfflineTracksTab onSelectTrack={onSelectTrack} currentTrackId={currentTrackId} />
      )}
      <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-hide" style={{ display: activeTab === 'offline' ? 'none' : undefined }}>
        {isLoading ? (
          <p className="text-center text-white/30 text-sm py-4">Searching...</p>
        ) : filteredTracks.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-4">No tracks found</p>
        ) : filteredTracks.map((track) => (
          <TrackRow key={track.id} track={track} isSelected={currentTrackId === track.id}
            isPreviewing={previewingId === track.id} onTogglePreview={() => togglePreview(track)}
            onSelect={() => handleSelect(track)} />
        ))}
      </div>
    </div>
  );
}

function TrackRow({ track, isSelected, isPreviewing, onTogglePreview, onSelect }: {
  track: MusicApiTrack; isSelected: boolean; isPreviewing: boolean;
  onTogglePreview: () => void; onSelect: () => void;
}) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg group transition ${
      isSelected ? 'bg-purple-500/20 border border-purple-500/30' : 'hover:bg-white/5'
    }`}>
      <button onClick={onTogglePreview} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        {isPreviewing ? (
          <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
        ) : (
          <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm truncate">{track.title}</p>
        <p className="text-white/40 text-xs truncate">{track.artist}</p>
      </div>
      {track.source !== 'mock' && <span className="text-white/20 text-[10px] shrink-0">{track.source}</span>}
      <span className="text-white/30 text-xs font-mono shrink-0">{formatDuration(track.duration)}</span>
      <button onClick={onSelect}
        className={`text-sm px-2 py-0.5 rounded transition shrink-0 ${
          isSelected ? 'bg-purple-500 text-white' : 'text-purple-400 opacity-0 group-hover:opacity-100'
        }`}>{isSelected ? 'Selected' : 'Use'}</button>
    </div>
  );
}

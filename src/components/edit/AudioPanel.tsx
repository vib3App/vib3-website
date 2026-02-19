'use client';

import Image from 'next/image';
import { useState, useRef, useCallback, useEffect } from 'react';
import { soundsApi } from '@/services/api/sounds';
import { NoiseReductionProcessor, normalizeAudio } from '@/services/audioProcessing/index';
import type { MusicTrack } from '@/types/sound';

interface AudioPanelProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  selectedMusic?: MusicTrack | null;
  onMusicSelect?: (track: MusicTrack | null) => void;
  musicVolume?: number;
  onMusicVolumeChange?: (volume: number) => void;
  audioDucking?: boolean;
  onAudioDuckingToggle?: () => void;
  duckingAmount?: number;
  onDuckingAmountChange?: (amount: number) => void;
  noiseReduction?: number;
  onNoiseReductionChange?: (value: number) => void;
}

export function AudioPanel({
  volume, onVolumeChange, selectedMusic, onMusicSelect, musicVolume = 0.5, onMusicVolumeChange,
  audioDucking = false, onAudioDuckingToggle, duckingAmount = 70, onDuckingAmountChange,
  noiseReduction = 0, onNoiseReductionChange,
}: AudioPanelProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [normalizeGain, setNormalizeGain] = useState<number | null>(null);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const noiseProcessorRef = useRef<NoiseReductionProcessor | null>(null);

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

  // Gap #23: Wire noise reduction to video element
  useEffect(() => {
    if (noiseReduction > 0) {
      const video = document.querySelector('video');
      if (!video) return;
      if (!noiseProcessorRef.current) {
        noiseProcessorRef.current = new NoiseReductionProcessor();
        noiseProcessorRef.current.connect(video, noiseReduction);
      } else {
        noiseProcessorRef.current.updateAmount(noiseReduction);
      }
    } else if (noiseProcessorRef.current) {
      noiseProcessorRef.current.disconnect();
      noiseProcessorRef.current = null;
    }
  }, [noiseReduction]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      noiseProcessorRef.current?.disconnect();
    };
  }, []);

  const togglePreview = useCallback((track: MusicTrack) => {
    if (previewingId === track.id) {
      audioRef.current?.pause(); setPreviewingId(null); return;
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
    audioRef.current?.pause(); setPreviewingId(null);
    onMusicSelect?.(track); setShowPicker(false);
  }, [onMusicSelect]);

  // Gap #38: Audio normalization
  const handleNormalize = useCallback(async () => {
    const video = document.querySelector('video');
    if (!video || !video.src) return;
    setIsNormalizing(true);
    try {
      const result = await normalizeAudio(video.src, -1);
      setNormalizeGain(result.gain);
      // Apply normalized volume
      onVolumeChange(Math.min(volume * result.gain, 1));
    } catch { /* ignore */ }
    finally { setIsNormalizing(false); }
  }, [volume, onVolumeChange]);

  return (
    <div className="space-y-4">
      <VolumeSlider label="Original Volume" value={volume} onChange={onVolumeChange} color="purple" />

      {/* Gap #38: Normalize button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleNormalize}
          disabled={isNormalizing}
          className="px-3 py-1.5 bg-teal-500/20 text-teal-300 rounded-lg text-xs hover:bg-teal-500/30 disabled:opacity-50"
        >
          {isNormalizing ? 'Analyzing...' : 'Normalize Audio'}
        </button>
        {normalizeGain !== null && (
          <span className="text-white/40 text-xs">
            Gain: {normalizeGain.toFixed(2)}x
          </span>
        )}
      </div>

      {selectedMusic ? (
        <SelectedTrackView
          track={selectedMusic} musicVolume={musicVolume}
          onMusicVolumeChange={onMusicVolumeChange} onRemove={() => onMusicSelect?.(null)}
        />
      ) : showPicker ? (
        <MusicPicker
          query={query} setQuery={setQuery} searchTracks={searchTracks}
          tracks={tracks} isLoading={isLoading} previewingId={previewingId}
          togglePreview={togglePreview} selectTrack={selectTrack}
          onCancel={() => setShowPicker(false)}
        />
      ) : (
        <button onClick={() => setShowPicker(true)}
          className="w-full py-3 border border-dashed border-white/20 text-white/50 rounded-xl hover:border-white/40">
          + Add Music
        </button>
      )}

      {/* Gap #24: Audio Ducking */}
      {selectedMusic && onAudioDuckingToggle && (
        <DuckingSection
          audioDucking={audioDucking} onToggle={onAudioDuckingToggle}
          duckingAmount={duckingAmount} onAmountChange={onDuckingAmountChange}
        />
      )}

      {/* Gap #23: Noise Reduction */}
      {onNoiseReductionChange && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="text-white text-sm">Noise Reduction</span>
              <p className="text-white/30 text-xs">
                {noiseReduction > 0 ? 'Active - filtering noise frequencies' : 'Reduce background noise'}
              </p>
            </div>
            <span className="text-white font-mono text-sm">{noiseReduction}%</span>
          </div>
          <input type="range" min="0" max="100" step="5" value={noiseReduction}
            onChange={e => onNoiseReductionChange(parseInt(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-teal-400" />
        </div>
      )}
    </div>
  );
}

function VolumeSlider({ label, value, onChange, color }: {
  label: string; value: number; onChange: (v: number) => void; color: string;
}) {
  return (
    <div>
      <label className="flex items-center justify-between text-white mb-2">
        <span>{label}</span><span>{Math.round(value * 100)}%</span>
      </label>
      <input type="range" min="0" max="1" step="0.01" value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} className={`w-full accent-${color}-500`} />
    </div>
  );
}

function SelectedTrackView({ track, musicVolume, onMusicVolumeChange, onRemove }: {
  track: MusicTrack; musicVolume: number; onMusicVolumeChange?: (v: number) => void; onRemove: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 aurora-bg rounded-xl">
        {track.coverUrl && (
          <Image src={track.coverUrl} alt={track.title + " cover"} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{track.title}</p>
          <p className="text-white/50 text-xs truncate">{track.artist}</p>
        </div>
        <button onClick={onRemove} className="text-white/40 hover:text-red-400 p-1" aria-label="Remove music">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <VolumeSlider label="Music Volume" value={musicVolume} onChange={(v) => onMusicVolumeChange?.(v)} color="teal" />
    </div>
  );
}

function MusicPicker({ query, setQuery, searchTracks, tracks, isLoading, previewingId, togglePreview, selectTrack, onCancel }: {
  query: string; setQuery: (q: string) => void; searchTracks: (q: string) => void;
  tracks: MusicTrack[]; isLoading: boolean; previewingId: string | null;
  togglePreview: (t: MusicTrack) => void; selectTrack: (t: MusicTrack) => void; onCancel: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchTracks(query)}
          placeholder="Search music..." className="flex-1 aurora-bg text-white px-3 py-2 rounded-lg text-sm outline-none placeholder:text-white/30" autoFocus />
        <button onClick={() => searchTracks(query)} className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm">Search</button>
      </div>
      <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-hide">
        {isLoading ? <div className="text-center py-4 text-white/40 text-sm">Loading...</div>
        : tracks.length === 0 ? <div className="text-center py-4 text-white/40 text-sm">No tracks found</div>
        : tracks.map(track => (
          <div key={track.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 group">
            <button onClick={() => togglePreview(track)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              {previewingId === track.id
                ? <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                : <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              }
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{track.title}</p>
              <p className="text-white/40 text-xs truncate">{track.artist}</p>
            </div>
            <button onClick={() => selectTrack(track)} className="text-sm text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity px-2">Use</button>
          </div>
        ))}
      </div>
      <button onClick={onCancel} className="w-full text-center text-white/40 text-sm py-1">Cancel</button>
    </div>
  );
}

function DuckingSection({ audioDucking, onToggle, duckingAmount, onAmountChange }: {
  audioDucking: boolean; onToggle: () => void; duckingAmount: number; onAmountChange?: (a: number) => void;
}) {
  return (
    <div className="space-y-2 pt-2 border-t border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-white text-sm">Audio Ducking</span>
          <p className="text-white/30 text-xs">Auto-lower music when voice detected</p>
        </div>
        <button onClick={onToggle}
          className={`w-10 h-5 rounded-full transition ${audioDucking ? 'bg-purple-500' : 'bg-white/20'}`}>
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${audioDucking ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
      {audioDucking && onAmountChange && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/40 text-xs">Duck Amount</span>
            <span className="text-white font-mono text-xs">{duckingAmount}%</span>
          </div>
          <input type="range" min="20" max="90" step="5" value={duckingAmount}
            onChange={e => onAmountChange(parseInt(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500" />
        </div>
      )}
    </div>
  );
}

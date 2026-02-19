'use client';

import { useOfflineTracks, type OfflineTrack } from '@/hooks/videoEditor/useOfflineTracks';

interface OfflineTracksTabProps {
  onSelectTrack: (track: { id: string; title: string; artist: string; url: string; duration: number }) => void;
  currentTrackId: string | null;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function OfflineTracksTab({ onSelectTrack, currentTrackId }: OfflineTracksTabProps) {
  const { downloadedTracks, isLoading, removeTrack, getOfflineUrl } = useOfflineTracks();

  const handleSelect = async (track: OfflineTrack) => {
    const offlineUrl = await getOfflineUrl(track.id);
    onSelectTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      url: offlineUrl || track.url,
      duration: track.duration,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-purple-500" />
      </div>
    );
  }

  if (downloadedTracks.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-10 h-10 mx-auto mb-2 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <p className="text-white/30 text-sm">No downloaded tracks</p>
        <p className="text-white/20 text-xs mt-1">Download tracks from the music library for offline use</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
      {downloadedTracks.map((track) => (
        <div
          key={track.id}
          className={`flex items-center gap-2 p-2 rounded-lg group transition ${
            currentTrackId === track.id ? 'bg-purple-500/20 border border-purple-500/30' : 'hover:bg-white/5'
          }`}
        >
          {/* Offline indicator */}
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm truncate">{track.title}</p>
            <p className="text-white/40 text-xs truncate">{track.artist}</p>
          </div>

          {/* Duration */}
          <span className="text-white/30 text-xs font-mono shrink-0">
            {formatDuration(track.duration)}
          </span>

          {/* Use button */}
          <button
            onClick={() => handleSelect(track)}
            className={`text-sm px-2 py-0.5 rounded transition shrink-0 ${
              currentTrackId === track.id
                ? 'bg-purple-500 text-white'
                : 'text-purple-400 opacity-0 group-hover:opacity-100'
            }`}
          >
            {currentTrackId === track.id ? 'Selected' : 'Use'}
          </button>

          {/* Remove button */}
          <button
            onClick={() => removeTrack(track.id)}
            className="text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition shrink-0"
            title="Remove download"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

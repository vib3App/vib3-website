'use client';

import { useRef, useState, useCallback } from 'react';

interface TimelineClip {
  id: string;
  startTime: number;
  endTime: number;
  type: 'video' | 'audio' | 'text' | 'effect';
  label: string;
  color: string;
}

interface TimelineTrackProps {
  clips: TimelineClip[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  onClipSelect?: (clipId: string) => void;
}

export function TimelineTrack({ clips, duration, currentTime, onSeek, onClipSelect }: TimelineTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSeek = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track || !duration) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(pct * duration);
  }, [duration, onSeek]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleSeek(e.clientX);
  }, [handleSeek]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging) handleSeek(e.clientX);
  }, [isDragging, handleSeek]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const playheadPos = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Group clips by type into tracks
  const trackTypes = ['video', 'audio', 'text', 'effect'] as const;
  const tracksByType = trackTypes.map(type => ({
    type,
    clips: clips.filter(c => c.type === type),
  })).filter(t => t.clips.length > 0);

  return (
    <div className="space-y-2">
      {/* Time ruler */}
      <div className="flex justify-between text-xs text-white/30 px-1">
        <span>0:00</span>
        <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
      </div>

      {/* Tracks */}
      <div
        ref={trackRef}
        className="relative bg-white/5 rounded-lg overflow-hidden cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {tracksByType.length > 0 ? (
          tracksByType.map(track => (
            <div key={track.type} className="relative h-8 border-b border-white/5 last:border-0">
              <span className="absolute left-1 top-0.5 text-[10px] text-white/20 uppercase z-10">{track.type}</span>
              {track.clips.map(clip => {
                const left = duration > 0 ? (clip.startTime / duration) * 100 : 0;
                const width = duration > 0 ? ((clip.endTime - clip.startTime) / duration) * 100 : 0;
                return (
                  <div
                    key={clip.id}
                    onClick={(e) => { e.stopPropagation(); onClipSelect?.(clip.id); }}
                    className="absolute top-1 bottom-1 rounded cursor-pointer hover:brightness-110 transition"
                    style={{ left: `${left}%`, width: `${width}%`, backgroundColor: clip.color }}
                  >
                    <span className="text-[10px] text-white/80 px-1 truncate block leading-6">{clip.label}</span>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="h-12 flex items-center justify-center text-white/20 text-xs">
            Timeline empty — add clips to begin
          </div>
        )}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none"
          style={{ left: `${playheadPos}%` }}
        >
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-white rounded-full" />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useCallback } from 'react';

export interface Clip {
  id: string;
  startTime: number;
  endTime: number;
  label: string;
}

interface SplitPanelProps {
  clips: Clip[];
  onClipsChange: (clips: Clip[]) => void;
  currentTime: number;
  duration: number;
  formatTime: (t: number) => string;
}

export function SplitPanel({ clips, onClipsChange, currentTime, duration, formatTime }: SplitPanelProps) {
  const splitAtPlayhead = useCallback(() => {
    if (currentTime <= 0 || currentTime >= duration) return;

    // Find which clip the playhead is in
    const clipIndex = clips.findIndex(c => currentTime > c.startTime && currentTime < c.endTime);
    if (clipIndex < 0) return;

    const clip = clips[clipIndex];
    const newClips = [...clips];
    newClips.splice(clipIndex, 1,
      { ...clip, id: `${clip.id}-a`, endTime: currentTime, label: `${clip.label}a` },
      { ...clip, id: `${clip.id}-b`, startTime: currentTime, label: `${clip.label}b` },
    );
    onClipsChange(newClips);
  }, [clips, currentTime, duration, onClipsChange]);

  const removeClip = useCallback((clipId: string) => {
    if (clips.length <= 1) return;
    onClipsChange(clips.filter(c => c.id !== clipId));
  }, [clips, onClipsChange]);

  const moveClip = useCallback((fromIndex: number, direction: -1 | 1) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= clips.length) return;
    const newClips = [...clips];
    [newClips[fromIndex], newClips[toIndex]] = [newClips[toIndex], newClips[fromIndex]];
    onClipsChange(newClips);
  }, [clips, onClipsChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-white text-sm font-medium">Clips ({clips.length})</label>
        <button
          onClick={splitAtPlayhead}
          disabled={currentTime <= 0 || currentTime >= duration}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 disabled:opacity-30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121" />
          </svg>
          Split at {formatTime(currentTime)}
        </button>
      </div>

      {/* Clip timeline visualization */}
      <div className="flex gap-0.5 h-12 rounded-lg overflow-hidden">
        {clips.map((clip, i) => {
          const widthPct = ((clip.endTime - clip.startTime) / duration) * 100;
          const colors = ['from-purple-500 to-purple-600', 'from-teal-500 to-teal-600', 'from-pink-500 to-pink-600', 'from-amber-500 to-amber-600', 'from-blue-500 to-blue-600'];
          return (
            <div
              key={clip.id}
              className={`bg-gradient-to-b ${colors[i % colors.length]} flex items-center justify-center text-white text-xs font-medium`}
              style={{ width: `${widthPct}%`, minWidth: '24px' }}
            >
              {clip.label}
            </div>
          );
        })}
      </div>

      {/* Clip list with reorder */}
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {clips.map((clip, i) => (
          <div key={clip.id} className="flex items-center gap-2 p-2 glass rounded-lg">
            <span className="text-white text-xs font-medium w-8">{clip.label}</span>
            <span className="text-white/60 text-xs flex-1">
              {formatTime(clip.startTime)} – {formatTime(clip.endTime)}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => moveClip(i, -1)}
                disabled={i === 0}
                className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 text-xs"
                title="Move up"
              >
                ▲
              </button>
              <button
                onClick={() => moveClip(i, 1)}
                disabled={i === clips.length - 1}
                className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 text-xs"
                title="Move down"
              >
                ▼
              </button>
              <button
                onClick={() => removeClip(clip.id)}
                disabled={clips.length <= 1}
                className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-300 disabled:opacity-20 text-xs"
                title="Remove clip"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

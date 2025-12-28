'use client';

import { RefObject } from 'react';

interface TrimPanelProps {
  videoLoaded: boolean;
  duration: number;
  currentTime: number;
  trimStart: number;
  trimEnd: number;
  thumbnails: string[];
  timelineRef: RefObject<HTMLDivElement | null>;
  formatTime: (seconds: number) => string;
  onMouseDown: (e: React.MouseEvent, type: 'start' | 'end' | 'playhead') => void;
}

export function TrimPanel({
  videoLoaded,
  duration,
  currentTime,
  trimStart,
  trimEnd,
  thumbnails,
  timelineRef,
  formatTime,
  onMouseDown,
}: TrimPanelProps) {
  if (!videoLoaded) return null;

  return (
    <div className="space-y-4">
      <div
        ref={timelineRef}
        className="relative h-16 bg-[#0A0E1A] rounded-lg overflow-hidden cursor-pointer"
      >
        <div className="absolute inset-0 flex">
          {thumbnails.map((thumb, i) => (
            <div key={i} className="flex-1 bg-cover bg-center" style={{ backgroundImage: `url(${thumb})` }} />
          ))}
        </div>

        <div className="absolute top-0 bottom-0 left-0 bg-black/70" style={{ width: `${(trimStart / duration) * 100}%` }} />
        <div className="absolute top-0 bottom-0 right-0 bg-black/70" style={{ width: `${((duration - trimEnd) / duration) * 100}%` }} />

        <div
          className="absolute top-0 bottom-0 w-3 bg-[#6366F1] cursor-ew-resize rounded-l"
          style={{ left: `calc(${(trimStart / duration) * 100}% - 6px)` }}
          onMouseDown={(e) => onMouseDown(e, 'start')}
        >
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/50" />
        </div>
        <div
          className="absolute top-0 bottom-0 w-3 bg-[#6366F1] cursor-ew-resize rounded-r"
          style={{ left: `${(trimEnd / duration) * 100}%` }}
          onMouseDown={(e) => onMouseDown(e, 'end')}
        >
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/50" />
        </div>

        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
          style={{ left: `${(currentTime / duration) * 100}%` }}
          onMouseDown={(e) => onMouseDown(e, 'playhead')}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
        </div>
      </div>

      <div className="flex justify-between text-sm">
        <div className="text-white/50">Start: <span className="text-white">{formatTime(trimStart)}</span></div>
        <div className="text-white/50">Duration: <span className="text-[#6366F1]">{formatTime(trimEnd - trimStart)}</span></div>
        <div className="text-white/50">End: <span className="text-white">{formatTime(trimEnd)}</span></div>
      </div>
    </div>
  );
}

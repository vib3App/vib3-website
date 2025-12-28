'use client';

import type { Chapter } from './types';
import { formatTime } from './types';

interface VideoProgressBarProps {
  progress: number;
  duration: number;
  buffered: number;
  chapters: Chapter[];
  onSeek: (time: number) => void;
}

export function VideoProgressBar({
  progress,
  duration,
  buffered,
  chapters,
  onSeek,
}: VideoProgressBarProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div className="relative w-full mb-3 group">
      {chapters.length > 0 && (
        <div className="absolute inset-x-0 h-1 pointer-events-none">
          {chapters.map((chapter, i) => (
            <div
              key={i}
              className="absolute top-0 w-0.5 h-full bg-white/50"
              style={{ left: `${(chapter.startTime / duration) * 100}%` }}
            />
          ))}
        </div>
      )}

      <div
        className="w-full h-1 bg-white/20 rounded-full cursor-pointer relative"
        onClick={handleClick}
      >
        <div
          className="absolute h-full bg-white/30 rounded-full"
          style={{ width: `${(buffered / duration) * 100 || 0}%` }}
        />
        <div
          className="absolute h-full bg-gradient-to-r from-[#6366F1] to-[#14B8A6] rounded-full"
          style={{ width: `${(progress / duration) * 100 || 0}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
        </div>
      </div>

      <div className="absolute -top-8 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div
          className="absolute bg-black/80 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2"
          style={{ left: `${(progress / duration) * 100}%` }}
        >
          {formatTime(progress)}
        </div>
      </div>
    </div>
  );
}

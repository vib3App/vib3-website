'use client';

import { useCallback } from 'react';

interface StorySegment {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number; // seconds
  thumbnailUrl?: string;
}

interface StoryTimelineProps {
  segments: StorySegment[];
  activeIndex: number;
  onSelectSegment: (index: number) => void;
  onReorderSegments: (segments: StorySegment[]) => void;
  onRemoveSegment: (index: number) => void;
  onAddSegment: () => void;
}

export function StoryTimeline({
  segments, activeIndex, onSelectSegment, onReorderSegments, onRemoveSegment, onAddSegment,
}: StoryTimelineProps) {
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

  const moveSegment = useCallback((fromIdx: number, direction: -1 | 1) => {
    const toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= segments.length) return;
    const newSegments = [...segments];
    [newSegments[fromIdx], newSegments[toIdx]] = [newSegments[toIdx], newSegments[fromIdx]];
    onReorderSegments(newSegments);
  }, [segments, onReorderSegments]);

  return (
    <div className="space-y-3">
      {/* Timeline bar */}
      <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden">
        {segments.map((seg, i) => (
          <button
            key={seg.id}
            onClick={() => onSelectSegment(i)}
            className={`h-full transition-all ${i === activeIndex ? 'bg-purple-400' : 'bg-white/20'}`}
            style={{ flex: seg.duration / totalDuration }}
          />
        ))}
      </div>

      {/* Segment cards */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {segments.map((seg, i) => (
          <div
            key={seg.id}
            onClick={() => onSelectSegment(i)}
            className={`relative flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition ${
              i === activeIndex ? 'border-purple-400' : 'border-transparent'
            }`}
          >
            {seg.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={seg.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-teal-500/30 flex items-center justify-center text-xs text-white">
                {seg.mediaType === 'video' ? '🎬' : '📷'}
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
              {seg.duration}s
            </div>
            <div className="absolute top-0 left-0 right-0 flex justify-between px-0.5">
              {i > 0 && (
                <button onClick={(e) => { e.stopPropagation(); moveSegment(i, -1); }}
                  className="text-white/60 text-[10px] hover:text-white">◀</button>
              )}
              <span />
              {i < segments.length - 1 && (
                <button onClick={(e) => { e.stopPropagation(); moveSegment(i, 1); }}
                  className="text-white/60 text-[10px] hover:text-white">▶</button>
              )}
            </div>
            {segments.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveSegment(i); }}
                className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* Add segment button */}
        <button
          onClick={onAddSegment}
          className="flex-shrink-0 w-16 h-24 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="text-white/40 text-xs text-center">
        {segments.length} segment{segments.length !== 1 ? 's' : ''} — {totalDuration}s total
      </div>
    </div>
  );
}

'use client';

interface StoryProgressBarProps {
  count: number;
  activeIndex: number;
  progress: number;
}

export function StoryProgressBar({ count, activeIndex, progress }: StoryProgressBarProps) {
  return (
    <div className="flex gap-1 px-2 pt-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{
              width: i < activeIndex ? '100%' : i === activeIndex ? `${progress}%` : '0%',
            }}
          />
        </div>
      ))}
    </div>
  );
}

'use client';

import Image from 'next/image';

interface SlideThumbnailProps {
  index: number;
  total: number;
  previewUrl: string;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function SlideThumbnail({ index, total, previewUrl, onRemove, onMoveUp, onMoveDown }: SlideThumbnailProps) {
  return (
    <div className="relative group rounded-xl overflow-hidden bg-white/5 aspect-[9/16]">
      <Image
        src={previewUrl}
        alt={`Slide ${index + 1}`}
        fill
        sizes="(max-width: 640px) 33vw, 160px"
        className="object-cover"
      />
      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] font-medium text-white">
        {index + 1}
      </div>
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-500 text-white text-sm flex items-center justify-center transition"
        aria-label="Remove slide"
      >
        ×
      </button>
      <div className="absolute bottom-1 inset-x-1 flex justify-between opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="w-7 h-7 rounded-full bg-black/70 hover:bg-purple-500 text-white text-xs disabled:opacity-30 disabled:hover:bg-black/70"
          aria-label="Move up"
        >
          ←
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="w-7 h-7 rounded-full bg-black/70 hover:bg-purple-500 text-white text-xs disabled:opacity-30 disabled:hover:bg-black/70"
          aria-label="Move down"
        >
          →
        </button>
      </div>
    </div>
  );
}

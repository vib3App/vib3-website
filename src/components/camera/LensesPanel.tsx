'use client';

import Image from 'next/image';
import type { CameraKitLens } from '@/hooks/camera/useCameraKit';

interface LensesPanelProps {
  lenses: CameraKitLens[];
  activeLensId: string | null;
  isLoading: boolean;
  error: string | null;
  onSelect: (lensId: string | null) => void;
}

export function LensesPanel({ lenses, activeLensId, isLoading, error, onSelect }: LensesPanelProps) {
  if (error) {
    return (
      <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
        <div className="text-white/60 text-sm text-center py-4">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* None option */}
        <button
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 w-16 h-16 rounded-xl bg-black/30 flex flex-col items-center justify-center ${
            activeLensId === null ? 'ring-2 ring-purple-500' : ''
          }`}
        >
          <span className="text-lg">🚫</span>
          <span className="text-white text-[10px] mt-1">None</span>
        </button>

        {lenses.map((lens) => (
          <button
            key={lens.id}
            onClick={() => onSelect(lens.id)}
            className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden relative ${
              activeLensId === lens.id ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            {lens.iconUrl ? (
              <Image
                src={lens.iconUrl}
                alt={lens.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-lg">🎭</span>
              </div>
            )}
            <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-0.5 text-center truncate px-0.5">
              {lens.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

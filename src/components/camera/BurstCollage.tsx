'use client';

import type { CapturedPhoto } from '@/hooks/camera/useCameraPhoto';

interface BurstCollageProps {
  photos: CapturedPhoto[];
  isBurstActive: boolean;
  onSelect: (photo: CapturedPhoto) => void;
  onDelete: (photoId: string) => void;
  onClose: () => void;
}

/**
 * Burst photo filmstrip selector and collage preview.
 * Shown after a burst capture completes, allowing the user
 * to scroll through burst photos and pick favourites.
 */
export function BurstCollage({
  photos, isBurstActive, onSelect, onDelete, onClose,
}: BurstCollageProps) {
  if (photos.length === 0 && !isBurstActive) return null;

  return (
    <div className="absolute bottom-44 left-0 right-0 z-10 px-4">
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {isBurstActive ? 'Capturing...' : `${photos.length} photos`}
            </span>
            {isBurstActive && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-sm"
          >
            Close
          </button>
        </div>

        {/* Filmstrip */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {photos.map((photo) => (
            <div key={photo.id} className="flex-shrink-0 relative group">
              <button
                onClick={() => onSelect(photo)}
                className="w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.dataUrl}
                  alt="Burst photo"
                  className="w-full h-full object-cover"
                />
              </button>
              <button
                onClick={() => onDelete(photo.id)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Hint */}
        {!isBurstActive && photos.length > 0 && (
          <p className="text-white/40 text-[10px] mt-1 text-center">
            Tap a photo to select it. Hover to delete.
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import type { PhotoMode, CollageLayout } from '@/hooks/camera/types';

interface PhotoBottomControlsProps {
  photoMode: PhotoMode;
  onPhotoModeChange: (mode: PhotoMode) => void;
  collageLayout: CollageLayout;
  onCollageLayoutChange: (layout: CollageLayout) => void;
  collageCount: number;
  collageTarget: number;
  isBurstActive: boolean;
  capturedCount: number;
  onShutter: () => void;
  onResetCollage: () => void;
  onViewPhotos: () => void;
}

export function PhotoBottomControls({
  photoMode, onPhotoModeChange,
  collageLayout, onCollageLayoutChange,
  collageCount, collageTarget,
  isBurstActive, capturedCount,
  onShutter, onResetCollage, onViewPhotos,
}: PhotoBottomControlsProps) {
  return (
    <div className="absolute bottom-8 left-0 right-0 z-10 px-4">
      {/* Photo mode tabs */}
      <div className="flex justify-center gap-2 mb-4">
        {(['single', 'burst', 'collage'] as PhotoMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onPhotoModeChange(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              photoMode === m
                ? 'bg-white text-black'
                : 'bg-black/30 text-white/70'
            }`}
          >
            {m === 'single' ? 'Single' : m === 'burst' ? 'Burst (10)' : 'Collage'}
          </button>
        ))}
      </div>

      {/* Collage layout picker */}
      {photoMode === 'collage' && (
        <div className="flex justify-center gap-2 mb-3">
          <button
            onClick={() => { onCollageLayoutChange('2x2'); onResetCollage(); }}
            className={`px-3 py-1 rounded-full text-xs ${
              collageLayout === '2x2' ? 'bg-purple-500 text-white' : 'bg-black/30 text-white/60'
            }`}
          >
            2x2
          </button>
          <button
            onClick={() => { onCollageLayoutChange('3x3'); onResetCollage(); }}
            className={`px-3 py-1 rounded-full text-xs ${
              collageLayout === '3x3' ? 'bg-purple-500 text-white' : 'bg-black/30 text-white/60'
            }`}
          >
            3x3
          </button>
          {collageCount > 0 && (
            <span className="text-white/60 text-xs self-center ml-2">
              {collageCount}/{collageTarget}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-6">
        {/* Left: view captured photos */}
        <button
          onClick={onViewPhotos}
          className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center relative"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {capturedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full text-white text-[10px] flex items-center justify-center">
              {capturedCount}
            </span>
          )}
        </button>

        {/* Shutter button */}
        <button
          onClick={onShutter}
          disabled={isBurstActive}
          className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${
            isBurstActive ? 'opacity-50' : 'active:scale-90'
          }`}
        >
          <div className={`w-16 h-16 rounded-full ${
            isBurstActive ? 'bg-yellow-400 animate-pulse' : 'bg-white'
          }`} />
        </button>

        {/* Right: spacer for symmetry */}
        <div className="w-12 h-12" />
      </div>
    </div>
  );
}

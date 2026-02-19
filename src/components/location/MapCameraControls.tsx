'use client';

import type { MapCameraState } from '@/types/location';

interface MapCameraControlsProps {
  camera: MapCameraState;
  onCameraChange: (update: Partial<MapCameraState>) => void;
  onRecenter: () => void;
}

export function MapCameraControls({ camera, onCameraChange, onRecenter }: MapCameraControlsProps) {
  const handleZoomIn = () => {
    onCameraChange({ zoom: Math.min(20, camera.zoom + 1) });
  };

  const handleZoomOut = () => {
    onCameraChange({ zoom: Math.max(1, camera.zoom - 1) });
  };

  const handleTiltUp = () => {
    onCameraChange({ tilt: Math.min(60, camera.tilt + 15) });
  };

  const handleTiltDown = () => {
    onCameraChange({ tilt: Math.max(0, camera.tilt - 15) });
  };

  const handleRotateLeft = () => {
    onCameraChange({ bearing: (camera.bearing - 45 + 360) % 360 });
  };

  const handleRotateRight = () => {
    onCameraChange({ bearing: (camera.bearing + 45) % 360 });
  };

  const handleResetView = () => {
    onCameraChange({ zoom: 14, tilt: 0, bearing: 0 });
    onRecenter();
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="glass-heavy rounded-xl border border-white/10 overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition"
          title="Zoom in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
        </button>
        <div className="border-t border-white/10" />
        <div className="px-2 py-1 text-center">
          <span className="text-white/50 text-[10px] font-mono">{camera.zoom}x</span>
        </div>
        <div className="border-t border-white/10" />
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition"
          title="Zoom out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
      </div>

      {/* Tilt & Rotation controls */}
      <div className="glass-heavy rounded-xl border border-white/10 overflow-hidden">
        <button
          onClick={handleTiltUp}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition"
          title="Tilt up"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <div className="border-t border-white/10" />
        <button
          onClick={handleTiltDown}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition"
          title="Tilt down"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Rotate controls */}
      <div className="glass-heavy rounded-xl border border-white/10 overflow-hidden">
        <button
          onClick={handleRotateLeft}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition"
          title="Rotate left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 010 10H9" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6L3 10l4 4" />
          </svg>
        </button>
        <div className="border-t border-white/10" />
        <button
          onClick={handleRotateRight}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition"
          title="Rotate right"
        >
          <svg className="w-4 h-4 transform scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 010 10H9" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6L3 10l4 4" />
          </svg>
        </button>
      </div>

      {/* Recenter / Reset */}
      <div className="glass-heavy rounded-xl border border-white/10 overflow-hidden">
        <button
          onClick={onRecenter}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition"
          title="Recenter on my location"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2M2 12h2m16 0h2" />
          </svg>
        </button>
        <div className="border-t border-white/10" />
        <button
          onClick={handleResetView}
          className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition text-[10px] font-mono"
          title="Reset view"
        >
          RST
        </button>
      </div>
    </div>
  );
}

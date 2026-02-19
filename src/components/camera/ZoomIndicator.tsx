'use client';

interface ZoomIndicatorProps {
  zoomLevel: number;
  zoomSupported: boolean;
  zoomPresets: number[];
  onPresetSelect: (zoom: number) => void;
}

export function ZoomIndicator({ zoomLevel, zoomSupported, zoomPresets, onPresetSelect }: ZoomIndicatorProps) {
  if (!zoomSupported) return null;

  return (
    <div className="absolute bottom-44 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-2 py-1">
        {zoomPresets.map((preset) => (
          <button
            key={preset}
            onClick={() => onPresetSelect(preset)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              Math.abs(zoomLevel - preset) < 0.5
                ? 'bg-white/20 text-white scale-110'
                : 'text-white/60'
            }`}
          >
            {preset}x
          </button>
        ))}
      </div>
    </div>
  );
}

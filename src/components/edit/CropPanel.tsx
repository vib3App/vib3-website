'use client';

interface CropPanelProps {
  selectedAspect: string | null;
  onSelect: (aspect: string | null) => void;
}

const CROP_PRESETS = [
  { label: 'Free', value: null, icon: '↔' },
  { label: '9:16', value: '9:16', icon: '📱' },
  { label: '16:9', value: '16:9', icon: '🖥' },
  { label: '1:1', value: '1:1', icon: '⬜' },
  { label: '4:5', value: '4:5', icon: '📸' },
  { label: '4:3', value: '4:3', icon: '📺' },
];

export function CropPanel({ selectedAspect, onSelect }: CropPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-white/60 text-sm">
        Select an aspect ratio for your video.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {CROP_PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => onSelect(p.value)}
            className={`py-3 rounded-xl text-center transition-colors ${
              selectedAspect === p.value
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <span className="text-lg block">{p.icon}</span>
            <span className="text-xs mt-1 block">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

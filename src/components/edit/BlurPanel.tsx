'use client';

interface BlurPanelProps {
  blurRadius: number;
  onBlurChange: (radius: number) => void;
}

const presets = [
  { label: 'None', value: 0 },
  { label: 'Light', value: 2 },
  { label: 'Medium', value: 5 },
  { label: 'Heavy', value: 10 },
  { label: 'Max', value: 20 },
];

export function BlurPanel({ blurRadius, onBlurChange }: BlurPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">Blur</h3>

      <div className="flex gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onBlurChange(p.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              blurRadius === p.value
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/60 text-sm">Radius</span>
          <span className="text-white font-mono text-sm">{blurRadius}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          step="0.5"
          value={blurRadius}
          onChange={(e) => onBlurChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-white/20 text-[10px]">
          <span>0px</span>
          <span>30px</span>
        </div>
      </div>

      <p className="text-white/30 text-xs">
        Blur is previewed via CSS filter and applied as FFmpeg boxblur during
        export.
      </p>
    </div>
  );
}

'use client';

interface VignettePanelProps {
  strength: number;
  onStrengthChange: (value: number) => void;
}

/** Darkens the frame edges. Strength 0 = off, 1 = strong. */
export function VignettePanel({ strength, onStrengthChange }: VignettePanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Vignette</h3>
        {strength > 0 && (
          <button
            onClick={() => onStrengthChange(0)}
            className="px-2 py-1 text-xs rounded-lg glass text-white/60 hover:text-white"
          >
            Reset
          </button>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/50 text-sm">Strength</span>
          <span className="text-white font-mono text-sm">{Math.round(strength * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={strength}
          onChange={e => onStrengthChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
        />
      </div>
    </div>
  );
}

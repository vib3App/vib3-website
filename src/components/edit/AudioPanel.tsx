'use client';

interface AudioPanelProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export function AudioPanel({ volume, onVolumeChange }: AudioPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center justify-between text-white mb-2">
          <span>Original Volume</span>
          <span>{Math.round(volume * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full accent-[#6366F1]"
        />
      </div>

      <button className="w-full py-3 border border-dashed border-white/20 text-white/50 rounded-xl hover:border-white/40">
        + Add Music
      </button>
    </div>
  );
}

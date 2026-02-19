'use client';

import { useState } from 'react';

interface SpeedPanelProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  reversed?: boolean;
  onReverseToggle?: () => void;
}

const presets = [
  { label: '0.25x', value: 0.25 },
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
  { label: '3x', value: 3 },
  { label: '4x', value: 4 },
];

export function SpeedPanel({ speed, onSpeedChange, reversed = false, onReverseToggle }: SpeedPanelProps) {
  const [useRamp, setUseRamp] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Playback Speed</h3>
        <div className="flex gap-2">
          {onReverseToggle && (
            <button
              onClick={onReverseToggle}
              className={`text-xs px-3 py-1 rounded-full transition ${reversed ? 'bg-red-500 text-white' : 'glass text-white/50'}`}
            >
              Reverse
            </button>
          )}
          <button
            onClick={() => setUseRamp(!useRamp)}
            className={`text-xs px-3 py-1 rounded-full transition ${useRamp ? 'bg-purple-500 text-white' : 'glass text-white/50'}`}
          >
            Speed Ramp
          </button>
        </div>
      </div>

      {/* Speed presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map(p => (
          <button
            key={p.value}
            onClick={() => onSpeedChange(p.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              speed === p.value
                ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white'
                : 'glass text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/40 text-xs">Custom</span>
          <span className="text-white font-mono text-sm">{speed.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0.25"
          max="4"
          step="0.05"
          value={speed}
          onChange={e => onSpeedChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {reversed && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 rounded-lg">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
          <span className="text-red-400 text-sm">Video will play backward</span>
        </div>
      )}

      {useRamp && (
        <div className="glass-card rounded-xl p-4">
          <p className="text-white/50 text-sm mb-2">Speed Ramp</p>
          <p className="text-white/30 text-xs">Drag on the timeline to create speed ramp points. The video will smoothly transition between speeds.</p>
          <div className="mt-3 h-12 bg-white/5 rounded-lg flex items-end px-2 gap-0.5">
            {Array.from({ length: 20 }).map((_, i) => {
              const h = i < 5 ? 30 : i < 10 ? 80 : i < 15 ? 50 : 30;
              return (
                <div key={i} className="flex-1 bg-purple-500/40 rounded-t-sm transition-all hover:bg-purple-500/60" style={{ height: `${h}%` }} />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

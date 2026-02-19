'use client';

import { useState } from 'react';

interface GreenScreenPanelProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  keyColor: string;
  onKeyColorChange: (color: string) => void;
  sensitivity: number;
  onSensitivityChange: (sensitivity: number) => void;
}

const presetColors = [
  { label: 'Green', value: '#00ff00' },
  { label: 'Blue', value: '#0000ff' },
  { label: 'Red', value: '#ff0000' },
  { label: 'White', value: '#ffffff' },
];

export function GreenScreenPanel({ enabled, onToggle, keyColor, onKeyColorChange, sensitivity, onSensitivityChange }: GreenScreenPanelProps) {
  const [backgroundType, setBackgroundType] = useState<'transparent' | 'image' | 'video'>('transparent');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Green Screen (Chroma Key)</h3>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-500' : 'bg-white/20'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {enabled && (
        <>
          {/* Key color selection */}
          <div>
            <p className="text-white/50 text-sm mb-2">Key Color</p>
            <div className="flex gap-2 items-center">
              {presetColors.map(c => (
                <button
                  key={c.value}
                  onClick={() => onKeyColorChange(c.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition ${keyColor === c.value ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
              <input
                type="color"
                value={keyColor}
                onChange={e => onKeyColorChange(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                title="Custom color"
              />
            </div>
          </div>

          {/* Sensitivity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-sm">Sensitivity</span>
              <span className="text-white font-mono text-sm">{sensitivity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={sensitivity}
              onChange={e => onSensitivityChange(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Background type */}
          <div>
            <p className="text-white/50 text-sm mb-2">Background</p>
            <div className="flex gap-2">
              {(['transparent', 'image', 'video'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setBackgroundType(type)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    backgroundType === type ? 'bg-purple-500 text-white' : 'glass text-white/50 hover:text-white'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Preview hint */}
          <div className="glass-card rounded-xl p-3">
            <p className="text-white/30 text-xs">Preview the chroma key effect in the video player above. Adjust sensitivity until the background is cleanly removed.</p>
          </div>
        </>
      )}
    </div>
  );
}

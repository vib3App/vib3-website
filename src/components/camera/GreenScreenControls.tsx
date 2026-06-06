'use client';

import { useRef } from 'react';

interface BgPreset {
  id: string;
  label: string;
  color: string;
}

interface GreenScreenControlsProps {
  enabled: boolean;
  onToggle: () => void;
  /** Solid-color background presets (honest color names, not scenes). */
  presets: readonly BgPreset[];
  /** Currently selected solid background color. */
  color: string;
  onColorChange: (color: string) => void;
  /** Object URL of an uploaded background image, or null for a solid color. */
  image: string | null;
  onPickImage: (file: File) => void;
  onClearImage: () => void;
  /** Chroma key color to remove from the camera feed. */
  keyColor: string;
  onKeyColorChange: (color: string) => void;
  /** 0–100 keying tolerance. */
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
}

// The colors a chroma backdrop is realistically made of. Green is the default;
// blue is the classic alternative for green-tinted subjects.
const KEY_PRESETS = [
  { label: 'Green', value: '#00ff00' },
  { label: 'Blue', value: '#0000ff' },
  { label: 'Red', value: '#ff0000' },
];

/**
 * Live green-screen (chroma key) controls for the camera screen. The keying is
 * done in useGreenScreen; this is purely the control surface. Backgrounds are
 * solid colors (named honestly as colors) or a user-uploaded image — there are
 * no canned "scene" backdrops that would oversell a flat fill.
 */
export function GreenScreenControls({
  enabled, onToggle, presets, color, onColorChange,
  image, onPickImage, onClearImage,
  keyColor, onKeyColorChange, sensitivity, onSensitivityChange,
}: GreenScreenControlsProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="absolute top-28 right-4 z-20 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={onToggle}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
          enabled ? 'bg-green-500 text-white' : 'bg-black/60 text-white/80 hover:bg-black/80'
        }`}
        aria-label={`Green screen ${enabled ? 'on' : 'off'}`}
      >
        <span className="mr-1" aria-hidden="true">🟩</span>
        Green Screen
      </button>

      {enabled && (
        <div className="w-44 flex flex-col gap-3 p-3 rounded-xl bg-black/80 backdrop-blur border border-white/10 max-h-[60vh] overflow-y-auto">
          {/* Background */}
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-wide mb-1.5">Background</p>
            <div className="flex flex-wrap gap-1.5 items-center">
              {presets.map(p => {
                const active = !image && color.toLowerCase() === p.color.toLowerCase();
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onColorChange(p.color)}
                    title={p.label}
                    className={`w-6 h-6 rounded-md border transition ${
                      active ? 'border-white scale-110' : 'border-white/30'
                    }`}
                    style={{ backgroundColor: p.color }}
                  />
                );
              })}
              <label
                className="w-6 h-6 rounded-md border border-white/30 cursor-pointer overflow-hidden flex items-center justify-center"
                title="Custom color"
              >
                <input
                  type="color"
                  value={image ? '#000000' : color}
                  onChange={e => onColorChange(e.target.value)}
                  className="w-8 h-8 cursor-pointer opacity-0"
                />
                <span className="absolute text-[10px]" aria-hidden="true">🎨</span>
              </label>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`flex-1 px-2 py-1 rounded-lg text-[11px] transition ${
                  image ? 'bg-green-500/30 text-white' : 'text-white/70 hover:bg-white/10 border border-white/15'
                }`}
              >
                {image ? '🖼 Image set' : '🖼 Upload image'}
              </button>
              {image && (
                <button
                  type="button"
                  onClick={onClearImage}
                  className="px-2 py-1 rounded-lg text-[11px] text-white/70 hover:bg-white/10"
                  title="Use a solid color instead"
                >
                  ✕
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) onPickImage(file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          {/* Key color */}
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-wide mb-1.5">Key color</p>
            <div className="flex gap-1.5 items-center">
              {KEY_PRESETS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onKeyColorChange(c.value)}
                  title={c.label}
                  className={`w-6 h-6 rounded-md border transition ${
                    keyColor.toLowerCase() === c.value.toLowerCase() ? 'border-white scale-110' : 'border-white/30'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <label
                className="w-6 h-6 rounded-md border border-white/30 cursor-pointer overflow-hidden flex items-center justify-center"
                title="Custom key color"
              >
                <input
                  type="color"
                  value={keyColor}
                  onChange={e => onKeyColorChange(e.target.value)}
                  className="w-8 h-8 cursor-pointer opacity-0"
                />
                <span className="absolute text-[10px]" aria-hidden="true">🎨</span>
              </label>
            </div>
          </div>

          {/* Sensitivity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/50 text-[10px] uppercase tracking-wide">Sensitivity</span>
              <span className="text-white/80 font-mono text-[11px]">{sensitivity}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={sensitivity}
              onChange={e => onSensitivityChange(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-green-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

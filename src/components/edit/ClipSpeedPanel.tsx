'use client';

import type { Clip } from './SplitPanel';

interface ClipSpeedPanelProps {
  clips: Clip[];
  onClipSpeedChange: (clipId: string, speed: number) => void;
  clipSpeeds: Record<string, number>;
  formatTime?: (t: number) => string;
}

const speedPresets = [0.25, 0.5, 1, 1.5, 2, 4];

function defaultFormatTime(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ClipSpeedPanel({
  clips,
  onClipSpeedChange,
  clipSpeeds,
  formatTime = defaultFormatTime,
}: ClipSpeedPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">Per-Clip Speed</h3>

      {clips.length === 0 && (
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-white/40 text-sm">
            No clips available. Split your video first to set individual clip speeds.
          </p>
        </div>
      )}

      {clips.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {clips.map((clip) => {
            const speed = clipSpeeds[clip.id] ?? 1;
            return (
              <div key={clip.id} className="glass-card rounded-xl p-3 space-y-2">
                {/* Clip header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium flex items-center justify-center">
                      {clip.label}
                    </span>
                    <span className="text-white/50 text-xs">
                      {formatTime(clip.startTime)} &ndash; {formatTime(clip.endTime)}
                    </span>
                  </div>
                  <span className="text-white font-mono text-sm">{speed.toFixed(2)}x</span>
                </div>

                {/* Speed presets for this clip */}
                <div className="flex gap-1">
                  {speedPresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => onClipSpeedChange(clip.id, preset)}
                      className={`flex-1 px-1 py-1 text-xs rounded-md transition ${
                        speed === preset
                          ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white'
                          : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {preset}x
                    </button>
                  ))}
                </div>

                {/* Fine-tune slider */}
                <input
                  type="range"
                  min="0.25"
                  max="4"
                  step="0.05"
                  value={speed}
                  onChange={(e) =>
                    onClipSpeedChange(clip.id, parseFloat(e.target.value))
                  }
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-white/20 text-[10px]">
                  <span>0.25x</span>
                  <span>4x</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {clips.length > 1 && (
        <div className="glass-card rounded-xl p-3">
          <p className="text-white/30 text-xs">
            Each clip can have its own playback speed. Use the Split tab to create
            more clips, then adjust speeds individually here.
          </p>
        </div>
      )}
    </div>
  );
}

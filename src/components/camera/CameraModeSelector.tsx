'use client';

import type { CameraMode } from '@/hooks/camera/types';

interface CameraModeSelectorProps {
  mode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
  disabled?: boolean;
}

export function CameraModeSelector({ mode, onModeChange, disabled }: CameraModeSelectorProps) {
  return (
    <div className="flex justify-center gap-6 mb-4">
      {(['photo', 'video', 'story'] as CameraMode[]).map((m) => (
        <button
          key={m}
          onClick={() => !disabled && onModeChange(m)}
          disabled={disabled}
          className={`text-sm font-semibold uppercase tracking-wider transition-all ${
            mode === m
              ? 'text-white scale-110'
              : 'text-white/50 hover:text-white/70'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {m}
          {mode === m && (
            <div className="w-1.5 h-1.5 rounded-full bg-white mx-auto mt-1" />
          )}
        </button>
      ))}
    </div>
  );
}

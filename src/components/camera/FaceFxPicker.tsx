'use client';

import type { FaceFx } from '@/hooks/camera/useFaceAR';

const ICONS: Record<FaceFx, string> = { off: '✖', zoom: '🔍', mask: '🐱', crown: '👑', animal: '🐶' };
const ORDER: readonly FaceFx[] = ['off', 'zoom', 'mask', 'crown', 'animal'];

interface FaceFxPickerProps {
  value: FaceFx;
  onSelect: (fx: FaceFx) => void;
}

/**
 * Top-left face-effect picker on the camera. Render only when face AR is
 * supported (see isFaceArSupported) so we never offer an effect that can't run.
 */
export function FaceFxPicker({ value, onSelect }: FaceFxPickerProps) {
  return (
    <div className="absolute top-40 md:top-28 left-4 z-20 flex flex-col gap-1 p-1 rounded-xl bg-black/70 backdrop-blur border border-white/10">
      {ORDER.map(fx => (
        <button
          key={fx}
          type="button"
          onClick={() => onSelect(fx)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition ${
            value === fx ? 'bg-pink-500/40 text-white' : 'text-white/70 hover:bg-white/10'
          }`}
          title={fx === 'off' ? 'No face effect' : `Face: ${fx}`}
        >
          <span aria-hidden="true">{ICONS[fx]}</span>
          <span className="capitalize">{fx}</span>
        </button>
      ))}
    </div>
  );
}

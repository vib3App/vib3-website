'use client';

import type { GridLayout } from '@/hooks/camera/useGridRecording';

interface GridSlotData {
  index: number;
  clipUrl: string | null;
  clipBlob: Blob | null;
}

interface GridLayoutSelectorProps {
  gridLayout: GridLayout;
  isGridMode: boolean;
  slots: GridSlotData[];
  activeSlotIndex: number;
  filledCount: number;
  isComplete: boolean;
  onSelectLayout: (layout: GridLayout) => void;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
  onReset: () => void;
}

const GRID_OPTIONS: { layout: GridLayout; label: string; icon: string }[] = [
  { layout: '1x1', label: 'Single', icon: '1' },
  { layout: '2x1', label: 'Side by Side', icon: '2' },
  { layout: '2x2', label: '2x2 Grid', icon: '4' },
  { layout: '1x3', label: 'Triple', icon: '3' },
];

function getGridDims(layout: GridLayout): { cols: number; rows: number } {
  switch (layout) {
    case '1x1': return { cols: 1, rows: 1 };
    case '2x1': return { cols: 2, rows: 1 };
    case '2x2': return { cols: 2, rows: 2 };
    case '1x3': return { cols: 1, rows: 3 };
  }
}

export function GridLayoutSelector({
  gridLayout, isGridMode, slots, activeSlotIndex, filledCount,
  isComplete, onSelectLayout, onSelectSlot, onClearSlot, onReset,
}: GridLayoutSelectorProps) {
  const { cols, rows } = getGridDims(gridLayout);

  return (
    <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
      {/* Layout selector row */}
      <div className="flex gap-2 justify-center mb-3">
        {GRID_OPTIONS.map(opt => (
          <button
            key={opt.layout}
            onClick={() => onSelectLayout(opt.layout)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              gridLayout === opt.layout
                ? 'bg-purple-500 text-white'
                : 'bg-black/30 text-white/70 hover:bg-white/10'
            }`}
          >
            <span className="text-xs block">{opt.icon}</span>
            <span className="text-[10px]">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Grid preview */}
      {isGridMode && (
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {slots.map((slot, i) => (
              <button
                key={i}
                onClick={() => slot.clipUrl ? onClearSlot(i) : onSelectSlot(i)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeSlotIndex
                    ? 'border-purple-500'
                    : slot.clipUrl
                    ? 'border-green-500/50'
                    : 'border-white/20'
                }`}
              >
                {slot.clipUrl ? (
                  <>
                    <video
                      src={slot.clipUrl}
                      className="w-full h-full object-cover"
                      muted playsInline
                    />
                    <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                      <span className="text-green-400 text-xs font-bold">Slot {i + 1}</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <span className="text-white/30 text-xs">
                      {i === activeSlotIndex ? 'Recording...' : `Slot ${i + 1}`}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/50 text-xs">
              {filledCount}/{slots.length} slots filled
            </span>
            {isComplete && (
              <span className="text-green-400 text-xs font-medium">Grid complete</span>
            )}
            {isGridMode && (
              <button
                onClick={onReset}
                className="text-red-400 text-xs hover:text-red-300"
              >
                Reset Grid
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

interface MasksPanelProps {
  selectedMask: string | null;
  onSelect: (mask: string | null) => void;
  maskInvert: boolean;
  onInvertToggle: () => void;
  maskFeather: number;
  onFeatherChange: (feather: number) => void;
}

const masks = [
  { id: 'circle', label: 'Circle', svg: 'M12 2a10 10 0 100 20 10 10 0 000-20z' },
  { id: 'rectangle', label: 'Rectangle', svg: 'M3 5h18v14H3z' },
  { id: 'heart', label: 'Heart', svg: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  { id: 'star', label: 'Star', svg: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'diamond', label: 'Diamond', svg: 'M12 2L2 12l10 10 10-10L12 2z' },
  { id: 'hexagon', label: 'Hexagon', svg: 'M12 2l8.66 5v10L12 22 3.34 17V7L12 2z' },
  { id: 'triangle', label: 'Triangle', svg: 'M12 2L2 22h20L12 2z' },
  { id: 'cross', label: 'Cross', svg: 'M9 2v7H2v6h7v7h6v-7h7V9h-7V2H9z' },
];

export function MasksPanel({
  selectedMask, onSelect, maskInvert, onInvertToggle, maskFeather, onFeatherChange,
}: MasksPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">Mask Shapes</h3>

      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onSelect(null)}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition ${
            selectedMask === null ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/5'
          }`}
        >
          <div className="w-full aspect-square rounded-lg bg-white/5 flex items-center justify-center">
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <span className="text-xs text-white/60">None</span>
        </button>
        {masks.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition ${
              selectedMask === m.id ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/5'
            }`}
          >
            <div className="w-full aspect-square rounded-lg bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d={m.svg} />
              </svg>
            </div>
            <span className="text-xs text-white/60">{m.label}</span>
          </button>
        ))}
      </div>

      {selectedMask && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Invert Mask</span>
            <button
              onClick={onInvertToggle}
              className={`w-10 h-5 rounded-full transition ${maskInvert ? 'bg-purple-500' : 'bg-white/20'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${maskInvert ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/40 text-xs">Feather</span>
              <span className="text-white font-mono text-xs">{maskFeather}px</span>
            </div>
            <input
              type="range" min="0" max="50" step="1" value={maskFeather}
              onChange={e => onFeatherChange(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

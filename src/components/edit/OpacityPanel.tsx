'use client';

interface OpacityPanelProps {
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  blendMode: string;
  onBlendModeChange: (mode: string) => void;
}

const blendModes = [
  { id: 'normal', label: 'Normal' },
  { id: 'multiply', label: 'Multiply' },
  { id: 'screen', label: 'Screen' },
  { id: 'overlay', label: 'Overlay' },
  { id: 'darken', label: 'Darken' },
  { id: 'lighten', label: 'Lighten' },
  { id: 'color-dodge', label: 'Dodge' },
  { id: 'color-burn', label: 'Burn' },
  { id: 'hard-light', label: 'Hard Light' },
  { id: 'soft-light', label: 'Soft Light' },
];

export function OpacityPanel({ opacity, onOpacityChange, blendMode, onBlendModeChange }: OpacityPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-medium">Opacity</h3>
          <span className="text-white font-mono text-sm">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01" value={opacity}
          onChange={e => onOpacityChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      <div>
        <h3 className="text-white font-medium mb-2">Blend Mode</h3>
        <div className="grid grid-cols-5 gap-2">
          {blendModes.map(m => (
            <button
              key={m.id}
              onClick={() => onBlendModeChange(m.id)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                blendMode === m.id
                  ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white'
                  : 'glass text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

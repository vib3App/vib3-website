'use client';

interface WatermarkOptionsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  position: string;
  onPositionChange: (position: string) => void;
  text: string;
  onTextChange: (text: string) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}

const positions = [
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'top-left', label: 'Top Left' },
  { id: 'center', label: 'Center' },
];

export function WatermarkOptions({
  enabled, onToggle, position, onPositionChange, text, onTextChange, opacity, onOpacityChange,
}: WatermarkOptionsProps) {
  return (
    <div className="p-4 glass-card rounded-xl">
      <button
        onClick={() => onToggle(!enabled)}
        className="w-full flex items-center justify-between text-white"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Add Watermark</span>
        </div>
        <div className={`w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-gradient-to-r from-purple-500 to-teal-400' : 'bg-white/20'}`}>
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'} mt-1`} />
        </div>
      </button>

      {enabled && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-white/50 text-sm mb-1">Watermark Text</label>
            <input
              type="text"
              value={text}
              onChange={e => onTextChange(e.target.value)}
              placeholder="@username or custom text..."
              className="w-full glass text-white px-3 py-2 rounded-lg outline-none text-sm placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="block text-white/50 text-sm mb-1">Position</label>
            <div className="flex flex-wrap gap-1.5">
              {positions.map(p => (
                <button
                  key={p.id}
                  onClick={() => onPositionChange(p.id)}
                  className={`px-3 py-1 rounded-lg text-xs transition ${
                    position === p.id ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-white/50 text-sm">Opacity</label>
              <span className="text-white/50 text-xs font-mono">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range" min="0.1" max="1" step="0.05" value={opacity}
              onChange={e => onOpacityChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

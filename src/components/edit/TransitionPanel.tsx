'use client';

interface TransitionPanelProps {
  selectedTransition: string;
  onSelect: (transition: string) => void;
  transitionDuration?: number;
  onDurationChange?: (duration: number) => void;
}

const transitions = [
  { id: 'none', label: 'None', preview: 'bg-white/5' },
  { id: 'crossfade', label: 'Crossfade', preview: 'bg-gradient-to-r from-white/20 to-transparent' },
  { id: 'fade', label: 'Fade', preview: 'bg-gradient-to-r from-white/10 via-white/20 to-white/10' },
  { id: 'fade-black', label: 'Fade Black', preview: 'bg-gradient-to-r from-black via-white/10 to-black' },
  { id: 'slide-left', label: 'Slide Left', preview: 'bg-gradient-to-l from-purple-500/30 to-transparent' },
  { id: 'slide-right', label: 'Slide Right', preview: 'bg-gradient-to-r from-purple-500/30 to-transparent' },
  { id: 'slide-up', label: 'Slide Up', preview: 'bg-gradient-to-t from-purple-500/30 to-transparent' },
  { id: 'slide-down', label: 'Slide Down', preview: 'bg-gradient-to-b from-purple-500/30 to-transparent' },
  { id: 'zoom-in', label: 'Zoom In', preview: 'bg-gradient-radial from-purple-500/30 to-transparent' },
  { id: 'zoom-out', label: 'Zoom Out', preview: 'bg-gradient-radial from-transparent to-purple-500/30' },
  { id: 'dissolve', label: 'Dissolve', preview: 'bg-white/10' },
  { id: 'wipe', label: 'Wipe', preview: 'bg-gradient-to-r from-teal-500/30 via-transparent to-transparent' },
  { id: 'spin', label: 'Spin', preview: 'bg-gradient-conic from-purple-500/30 via-transparent to-purple-500/30' },
  { id: 'glitch', label: 'Glitch', preview: 'bg-gradient-to-r from-red-500/20 via-green-500/20 to-blue-500/20' },
  { id: 'flash', label: 'Flash', preview: 'bg-white/30' },
];

const durationPresets = [
  { label: '0.25s', value: 0.25 },
  { label: '0.5s', value: 0.5 },
  { label: '0.75s', value: 0.75 },
  { label: '1s', value: 1 },
  { label: '1.5s', value: 1.5 },
  { label: '2s', value: 2 },
];

export function TransitionPanel({
  selectedTransition, onSelect, transitionDuration = 0.5, onDurationChange,
}: TransitionPanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-white font-medium">Transitions</h3>
      <p className="text-white/30 text-xs">Applied between clips in multi-clip videos</p>
      <div className="grid grid-cols-4 gap-2">
        {transitions.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition ${
              selectedTransition === t.id ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/5'
            }`}
          >
            <div className={`w-full aspect-video rounded-lg ${t.preview}`} />
            <span className="text-xs text-white/60">{t.label}</span>
          </button>
        ))}
      </div>

      {selectedTransition !== 'none' && onDurationChange && (
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Duration</span>
            <span className="text-white font-mono text-sm">{transitionDuration}s</span>
          </div>
          <div className="flex gap-2">
            {durationPresets.map(d => (
              <button
                key={d.value}
                onClick={() => onDurationChange(d.value)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                  transitionDuration === d.value
                    ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white'
                    : 'glass text-white/60 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

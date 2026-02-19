'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface Transition3DPanelProps {
  selectedTransition3D: string;
  onSelect: (transition: string) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
}

interface Transition3DPreset {
  id: string;
  label: string;
  cssTransform: string;
  description: string;
}

const TRANSITIONS_3D: Transition3DPreset[] = [
  {
    id: 'none', label: 'None', cssTransform: '',
    description: 'No 3D transition',
  },
  {
    id: 'cube-rotate', label: 'Cube Rotate', cssTransform: 'rotateY(90deg)',
    description: 'Clips rotate like faces of a cube',
  },
  {
    id: 'flip-h', label: 'Flip H', cssTransform: 'rotateY(180deg)',
    description: 'Horizontal card flip between clips',
  },
  {
    id: 'flip-v', label: 'Flip V', cssTransform: 'rotateX(180deg)',
    description: 'Vertical card flip between clips',
  },
  {
    id: 'fold', label: 'Fold', cssTransform: 'rotateY(45deg) scaleX(0.8)',
    description: 'Page fold effect between clips',
  },
  {
    id: 'zoom-through', label: 'Zoom Through', cssTransform: 'translateZ(500px) scale(0)',
    description: 'Zoom through to next clip',
  },
  {
    id: 'door-open', label: 'Door Open', cssTransform: 'perspective(800px) rotateY(-60deg)',
    description: 'Clip opens like a door to reveal next',
  },
  {
    id: 'swing', label: 'Swing', cssTransform: 'rotateX(45deg) translateY(-20%)',
    description: 'Clip swings away to reveal next',
  },
];

const DURATION_PRESETS = [
  { label: '0.3s', value: 0.3 },
  { label: '0.5s', value: 0.5 },
  { label: '0.75s', value: 0.75 },
  { label: '1s', value: 1.0 },
  { label: '1.5s', value: 1.5 },
];

export function Transition3DPanel({
  selectedTransition3D, onSelect, duration, onDurationChange,
}: Transition3DPanelProps) {
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handlePreview = useCallback((id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPreviewingId(id);
    timeoutRef.current = setTimeout(() => setPreviewingId(null), 1200);
  }, []);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const getPreviewStyle = (id: string): React.CSSProperties => {
    if (previewingId !== id) return {};
    const preset = TRANSITIONS_3D.find(t => t.id === id);
    if (!preset || !preset.cssTransform) return {};
    return {
      transform: preset.cssTransform,
      transition: `transform ${duration}s ease-in-out`,
    };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">3D Transitions</h3>
      <p className="text-white/30 text-xs">Applied between clips with CSS 3D transforms, rendered via canvas on export</p>

      <div className="grid grid-cols-4 gap-2">
        {TRANSITIONS_3D.map(t => (
          <button key={t.id}
            onClick={() => { onSelect(t.id); handlePreview(t.id); }}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition ${
              selectedTransition3D === t.id
                ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/5'
            }`}>
            <div ref={selectedTransition3D === t.id ? previewRef : null}
              className="w-full aspect-video rounded-lg bg-gradient-to-br from-purple-500/30 to-teal-500/30 overflow-hidden"
              style={{
                perspective: '200px',
                transformStyle: 'preserve-3d',
              }}>
              <div className="w-full h-full bg-gradient-to-br from-purple-500/40 to-teal-500/40 flex items-center justify-center"
                style={getPreviewStyle(t.id)}>
                <span className="text-white/50 text-[8px]">{t.id !== 'none' ? '3D' : ''}</span>
              </div>
            </div>
            <span className="text-xs text-white/60">{t.label}</span>
          </button>
        ))}
      </div>

      {selectedTransition3D !== 'none' && (
        <>
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Duration</span>
              <span className="text-white font-mono text-sm">{duration}s</span>
            </div>
            <div className="flex gap-2">
              {DURATION_PRESETS.map(d => (
                <button key={d.value} onClick={() => onDurationChange(d.value)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                    duration === d.value
                      ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white'
                      : 'glass text-white/60 hover:text-white'
                  }`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-3">
            <p className="text-white/30 text-xs">
              {TRANSITIONS_3D.find(t => t.id === selectedTransition3D)?.description}.
              Preview uses CSS 3D transforms. Export renders transitions frame-by-frame via canvas.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

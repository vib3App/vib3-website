'use client';

import { useState, useEffect, useRef } from 'react';

export interface TextAnimationPreset {
  id: string;
  name: string;
  keyframes: string;
  duration: number;
}

interface TextAnimationSelectorProps {
  selectedAnimation: string | null;
  onAnimationChange: (animationId: string | null) => void;
  animationDuration: number;
  onDurationChange: (duration: number) => void;
}

const ANIMATIONS: TextAnimationPreset[] = [
  {
    id: 'fade-in', name: 'Fade In', duration: 0.8,
    keyframes: `@keyframes vib3FadeIn { from { opacity: 0; } to { opacity: 1; } }`,
  },
  {
    id: 'fade-out', name: 'Fade Out', duration: 0.8,
    keyframes: `@keyframes vib3FadeOut { from { opacity: 1; } to { opacity: 0; } }`,
  },
  {
    id: 'typewriter', name: 'Typewriter', duration: 2,
    keyframes: `@keyframes vib3Typewriter { from { width: 0; } to { width: 100%; } }`,
  },
  {
    id: 'bounce', name: 'Bounce', duration: 1,
    keyframes: `@keyframes vib3Bounce { 0%,20%,50%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-20px); } 60% { transform: translateY(-10px); } }`,
  },
  {
    id: 'slide-in', name: 'Slide In', duration: 0.6,
    keyframes: `@keyframes vib3SlideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`,
  },
  {
    id: 'slide-out', name: 'Slide Out', duration: 0.6,
    keyframes: `@keyframes vib3SlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }`,
  },
  {
    id: 'zoom', name: 'Zoom', duration: 0.5,
    keyframes: `@keyframes vib3Zoom { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`,
  },
  {
    id: 'spin', name: 'Spin', duration: 0.8,
    keyframes: `@keyframes vib3Spin { from { transform: rotate(0deg) scale(0); opacity: 0; } to { transform: rotate(360deg) scale(1); opacity: 1; } }`,
  },
  {
    id: 'wave', name: 'Wave', duration: 1.5,
    keyframes: `@keyframes vib3Wave { 0%,100% { transform: translateY(0); } 25% { transform: translateY(-8px); } 75% { transform: translateY(8px); } }`,
  },
  {
    id: 'glitch', name: 'Glitch', duration: 0.5,
    keyframes: `@keyframes vib3Glitch { 0% { transform: translate(0); } 20% { transform: translate(-3px, 3px); } 40% { transform: translate(-3px, -3px); } 60% { transform: translate(3px, 3px); } 80% { transform: translate(3px, -3px); } 100% { transform: translate(0); } }`,
  },
];

const ANIM_NAME_MAP: Record<string, string> = {
  'fade-in': 'vib3FadeIn',
  'fade-out': 'vib3FadeOut',
  'typewriter': 'vib3Typewriter',
  'bounce': 'vib3Bounce',
  'slide-in': 'vib3SlideIn',
  'slide-out': 'vib3SlideOut',
  'zoom': 'vib3Zoom',
  'spin': 'vib3Spin',
  'wave': 'vib3Wave',
  'glitch': 'vib3Glitch',
};

export function TextAnimationSelector({
  selectedAnimation, onAnimationChange, animationDuration, onDurationChange,
}: TextAnimationSelectorProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Inject keyframe styles
  useEffect(() => {
    if (styleRef.current) return;
    const style = document.createElement('style');
    style.textContent = ANIMATIONS.map(a => a.keyframes).join('\n');
    document.head.appendChild(style);
    styleRef.current = style;
    return () => { style.remove(); styleRef.current = null; };
  }, []);

  const handlePreview = (id: string) => {
    setPreviewId(null);
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    requestAnimationFrame(() => {
      setPreviewId(id);
      const dur = ANIMATIONS.find(a => a.id === id)?.duration || 1;
      previewTimeoutRef.current = setTimeout(() => setPreviewId(null), dur * 1000 + 200);
    });
  };

  const getPreviewStyle = (id: string): React.CSSProperties => {
    if (previewId !== id) return {};
    const animName = ANIM_NAME_MAP[id];
    const dur = ANIMATIONS.find(a => a.id === id)?.duration || 1;
    return {
      animation: `${animName} ${dur}s ease forwards`,
      ...(id === 'typewriter' ? { overflow: 'hidden', whiteSpace: 'nowrap' as const, display: 'inline-block' } : {}),
    };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">Text Animations</h3>

      <div className="grid grid-cols-2 gap-2">
        {ANIMATIONS.map(anim => (
          <button key={anim.id}
            onClick={() => {
              onAnimationChange(selectedAnimation === anim.id ? null : anim.id);
              handlePreview(anim.id);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
              selectedAnimation === anim.id
                ? 'ring-2 ring-purple-500 bg-purple-500/20'
                : 'bg-white/5 hover:bg-white/10'
            }`}>
            <div className="w-16 h-8 flex items-center justify-center overflow-hidden">
              <span className="text-white text-xs font-bold" style={getPreviewStyle(anim.id)}>
                Text
              </span>
            </div>
            <span className="text-xs text-white/70">{anim.name}</span>
          </button>
        ))}
      </div>

      {selectedAnimation && (
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Duration</span>
            <span className="text-white font-mono text-sm">{animationDuration.toFixed(1)}s</span>
          </div>
          <input type="range" min="0.2" max="3" step="0.1" value={animationDuration}
            onChange={e => onDurationChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500" />
          <button onClick={() => handlePreview(selectedAnimation)}
            className="mt-2 w-full py-2 rounded-lg bg-purple-500/20 text-purple-300 text-sm hover:bg-purple-500/30 transition">
            Replay Preview
          </button>
        </div>
      )}

      {!selectedAnimation && (
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-white/40 text-sm">Select an animation for text overlays.</p>
          <p className="text-white/25 text-xs mt-1">Applied as CSS keyframes during preview, rendered on export.</p>
        </div>
      )}
    </div>
  );
}

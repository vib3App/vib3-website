'use client';

import { useEffect, useRef } from 'react';

/**
 * AnimatedTextOverlay - Gap #21
 * Renders text overlays with CSS animation based on the selected animation type.
 * Injects keyframe styles and applies them to text elements.
 */

interface AnimatedTextOverlayProps {
  text: string;
  animationType: string | null;
  animationDuration: number;
  color: string;
  fontSize: number;
  fontFamily?: string;
  isPlaying?: boolean;
}

const KEYFRAMES: Record<string, string> = {
  'fade-in': `@keyframes vib3OverlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }`,
  'fade-out': `@keyframes vib3OverlayFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }`,
  'typewriter': `@keyframes vib3OverlayTypewriter {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }`,
  'bounce': `@keyframes vib3OverlayBounce {
    0%, 20%, 50%, 80%, 100% { transform: translate(-50%, -50%) translateY(0); }
    40% { transform: translate(-50%, -50%) translateY(-20px); }
    60% { transform: translate(-50%, -50%) translateY(-10px); }
  }`,
  'slide-in': `@keyframes vib3OverlaySlideIn {
    from { transform: translate(-150%, -50%); opacity: 0; }
    to { transform: translate(-50%, -50%); opacity: 1; }
  }`,
  'slide-out': `@keyframes vib3OverlaySlideOut {
    from { transform: translate(-50%, -50%); opacity: 1; }
    to { transform: translate(50%, -50%); opacity: 0; }
  }`,
  'zoom': `@keyframes vib3OverlayZoom {
    from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }`,
  'spin': `@keyframes vib3OverlaySpin {
    from { transform: translate(-50%, -50%) rotate(0deg) scale(0); opacity: 0; }
    to { transform: translate(-50%, -50%) rotate(360deg) scale(1); opacity: 1; }
  }`,
  'wave': `@keyframes vib3OverlayWave {
    0%, 100% { transform: translate(-50%, -50%) translateY(0); }
    25% { transform: translate(-50%, -50%) translateY(-8px); }
    75% { transform: translate(-50%, -50%) translateY(8px); }
  }`,
  'glitch': `@keyframes vib3OverlayGlitch {
    0% { transform: translate(-50%, -50%); }
    20% { transform: translate(calc(-50% - 3px), calc(-50% + 3px)); filter: hue-rotate(90deg); }
    40% { transform: translate(calc(-50% - 3px), calc(-50% - 3px)); filter: hue-rotate(180deg); }
    60% { transform: translate(calc(-50% + 3px), calc(-50% + 3px)); filter: hue-rotate(270deg); }
    80% { transform: translate(calc(-50% + 3px), calc(-50% - 3px)); filter: hue-rotate(0deg); }
    100% { transform: translate(-50%, -50%); }
  }`,
};

const ANIM_NAME_MAP: Record<string, string> = {
  'fade-in': 'vib3OverlayFadeIn',
  'fade-out': 'vib3OverlayFadeOut',
  'typewriter': 'vib3OverlayTypewriter',
  'bounce': 'vib3OverlayBounce',
  'slide-in': 'vib3OverlaySlideIn',
  'slide-out': 'vib3OverlaySlideOut',
  'zoom': 'vib3OverlayZoom',
  'spin': 'vib3OverlaySpin',
  'wave': 'vib3OverlayWave',
  'glitch': 'vib3OverlayGlitch',
};

const LOOPING_ANIMS = new Set(['bounce', 'wave', 'glitch']);

export function AnimatedTextOverlay({
  text,
  animationType,
  animationDuration,
  color,
  fontSize,
  fontFamily = 'sans-serif',
  isPlaying = true,
}: AnimatedTextOverlayProps) {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Inject keyframes into document head
  useEffect(() => {
    if (styleRef.current) return;
    const style = document.createElement('style');
    style.textContent = Object.values(KEYFRAMES).join('\n');
    document.head.appendChild(style);
    styleRef.current = style;
    return () => {
      style.remove();
      styleRef.current = null;
    };
  }, []);

  const getAnimationStyle = (): React.CSSProperties => {
    if (!animationType || !isPlaying) return {};
    const animName = ANIM_NAME_MAP[animationType];
    if (!animName) return {};

    const isLooping = LOOPING_ANIMS.has(animationType);
    const iteration = isLooping ? 'infinite' : '1';
    const fillMode = isLooping ? 'none' : 'forwards';

    return {
      animation: `${animName} ${animationDuration}s ease ${fillMode}`,
      animationIterationCount: iteration,
      animationPlayState: isPlaying ? 'running' : 'paused',
    };
  };

  return (
    <span
      style={{
        color,
        fontSize,
        fontFamily,
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        whiteSpace: 'nowrap',
        ...getAnimationStyle(),
      }}
    >
      {text}
    </span>
  );
}

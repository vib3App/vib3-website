'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Transition3DPreview - Gap #22
 * Renders CSS 3D transform transitions over the video preview during playback.
 * Monitors video currentTime and triggers the transition at clip boundaries.
 */

interface Transition3DPreviewProps {
  transitionType: string;
  duration: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Clip boundary times where transitions should occur */
  clipBoundaries: number[];
}

interface TransitionDef {
  outgoing: string;
  incoming: string;
}

const TRANSITION_MAP: Record<string, TransitionDef> = {
  'cube-rotate': {
    outgoing: 'rotateY(-90deg) translateZ(50%)',
    incoming: 'rotateY(90deg) translateZ(50%)',
  },
  'flip-h': {
    outgoing: 'rotateY(180deg)',
    incoming: 'rotateY(-180deg)',
  },
  'flip-v': {
    outgoing: 'rotateX(180deg)',
    incoming: 'rotateX(-180deg)',
  },
  'fold': {
    outgoing: 'rotateY(45deg) scaleX(0.5)',
    incoming: 'rotateY(-45deg) scaleX(0.5)',
  },
  'zoom-through': {
    outgoing: 'translateZ(500px) scale(2)',
    incoming: 'translateZ(-500px) scale(0.5)',
  },
  'door-open': {
    outgoing: 'perspective(800px) rotateY(-90deg)',
    incoming: 'perspective(800px) rotateY(90deg)',
  },
  'swing': {
    outgoing: 'rotateX(60deg) translateY(-30%)',
    incoming: 'rotateX(-60deg) translateY(30%)',
  },
};

export function Transition3DPreview({
  transitionType,
  duration,
  videoRef,
  clipBoundaries,
}: Transition3DPreviewProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const animFrameRef = useRef<number>(0);
  const transitionStartRef = useRef<number | null>(null);
  const lastBoundaryRef = useRef<number | null>(null);

  const checkTransition = useCallback(() => {
    const video = videoRef.current;
    if (!video || transitionType === 'none' || clipBoundaries.length === 0) {
      animFrameRef.current = requestAnimationFrame(checkTransition);
      return;
    }

    const currentTime = video.currentTime;

    // Check if we're near a clip boundary
    for (const boundary of clipBoundaries) {
      const timeToBoundary = currentTime - boundary;
      const halfDur = duration / 2;

      if (
        timeToBoundary >= -halfDur &&
        timeToBoundary <= halfDur &&
        lastBoundaryRef.current !== boundary
      ) {
        // Start transition
        if (!isTransitioning) {
          setIsTransitioning(true);
          transitionStartRef.current = boundary - halfDur;
          lastBoundaryRef.current = boundary;
        }

        const elapsed = currentTime - (boundary - halfDur);
        const p = Math.max(0, Math.min(1, elapsed / duration));
        setProgress(p);
        break;
      }
    }

    // End transition when progress reaches 1
    if (isTransitioning && progress >= 0.99) {
      setIsTransitioning(false);
      setProgress(0);
      transitionStartRef.current = null;
      // Allow same boundary to trigger again after enough time
      setTimeout(() => { lastBoundaryRef.current = null; }, 500);
    }

    animFrameRef.current = requestAnimationFrame(checkTransition);
  }, [videoRef, transitionType, duration, clipBoundaries, isTransitioning, progress]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(checkTransition);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [checkTransition]);

  if (!isTransitioning || transitionType === 'none') return null;

  const def = TRANSITION_MAP[transitionType];
  if (!def) return null;

  // First half: outgoing clip transforms away. Second half: incoming reverses.
  const isFirstHalf = progress < 0.5;
  const halfProgress = isFirstHalf ? progress * 2 : (progress - 0.5) * 2;

  const transform = isFirstHalf
    ? interpolateTransform('none', def.outgoing, halfProgress)
    : interpolateTransform(def.incoming, 'none', halfProgress);

  const overlayOpacity = isFirstHalf ? halfProgress * 0.3 : (1 - halfProgress) * 0.3;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        perspective: '800px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Transition overlay effect */}
      <div
        className="absolute inset-0"
        style={{
          transform,
          transformOrigin: 'center center',
          backfaceVisibility: 'hidden',
          transition: 'none',
        }}
      />
      {/* Dark overlay during transition */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
}

/**
 * Simple interpolation between "none" and a CSS transform string.
 * For the preview effect, we scale the transform by progress.
 */
function interpolateTransform(from: string, to: string, t: number): string {
  if (from === 'none' && to === 'none') return 'none';
  if (from === 'none') {
    // Scale the target transform by t
    return scaleTransform(to, t);
  }
  if (to === 'none') {
    // Scale the source transform by (1-t)
    return scaleTransform(from, 1 - t);
  }
  return scaleTransform(to, t);
}

function scaleTransform(transform: string, factor: number): string {
  // Replace numeric values in the transform with scaled versions
  return transform.replace(
    /(-?\d+\.?\d*)(deg|px|%)?/g,
    (_, num, unit) => {
      const scaled = parseFloat(num) * factor;
      return `${scaled.toFixed(2)}${unit || ''}`;
    },
  );
}

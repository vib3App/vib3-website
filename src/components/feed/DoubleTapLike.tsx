'use client';

import { useState, useCallback, useRef } from 'react';

interface DoubleTapLikeProps {
  onDoubleTap: () => void;
  children: React.ReactNode;
}

/**
 * DoubleTapLike - Wraps a video element to detect double-tap and show
 * an animated heart burst overlay. Two taps within 300ms triggers like.
 */
export function DoubleTapLike({ onDoubleTap, children }: DoubleTapLikeProps) {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastTapRef = useRef(0);
  const heartIdRef = useRef(0);

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const now = Date.now();
      const delta = now - lastTapRef.current;
      lastTapRef.current = now;

      if (delta < 300 && delta > 0) {
        // Double tap detected
        onDoubleTap();

        // Get tap position relative to container
        let clientX: number;
        let clientY: number;
        if ('touches' in e) {
          // Touch event - use the last known touch position
          const touch = e.changedTouches?.[0];
          if (!touch) return;
          clientX = touch.clientX;
          clientY = touch.clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const id = heartIdRef.current++;
        setHearts((prev) => [...prev, { id, x, y }]);

        // Remove after animation completes
        setTimeout(() => {
          setHearts((prev) => prev.filter((h) => h.id !== id));
        }, 800);
      }
    },
    [onDoubleTap]
  );

  return (
    <div
      className="relative w-full h-full"
      onClick={handleTap}
      onTouchEnd={handleTap}
    >
      {children}

      {/* Heart burst overlays */}
      {hearts.map((heart) => (
        <HeartBurst key={heart.id} x={heart.x} y={heart.y} />
      ))}

      <style jsx global>{`
        @keyframes heart-burst-scale {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }
        @keyframes heart-burst-particle {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes like-explode {
          0% {
            transform: scale(0) rotate(-15deg);
            opacity: 0;
          }
          40% {
            transform: scale(1.3) rotate(5deg);
            opacity: 1;
          }
          70% {
            transform: scale(0.95) rotate(-2deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function HeartBurst({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none z-30"
      style={{ left: x, top: y }}
    >
      {/* Glow */}
      <div
        className="absolute w-32 h-32 bg-gradient-to-r from-pink-500/40 to-red-500/40 rounded-full blur-2xl"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'heart-burst-scale 0.8s ease-out forwards',
        }}
      />

      {/* Main heart */}
      <svg
        className="absolute w-20 h-20"
        viewBox="0 0 24 24"
        style={{
          left: '50%',
          top: '50%',
          animation: 'heart-burst-scale 0.8s ease-out forwards',
        }}
      >
        <defs>
          <linearGradient id="doubleTapHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path
          fill="url(#doubleTapHeartGrad)"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>

      {/* Small particles */}
      {PARTICLE_OFFSETS.map((offset, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-pink-400"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            animation: 'heart-burst-particle 0.6s ease-out forwards',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

const PARTICLE_OFFSETS = [
  { x: -30, y: -30 },
  { x: 30, y: -30 },
  { x: -40, y: 0 },
  { x: 40, y: 0 },
  { x: -25, y: 25 },
  { x: 25, y: 25 },
];

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailPoint {
  id: number;
  x: number;
  y: number;
}

interface CursorTrailProps {
  enabled?: boolean;
  color?: string;
  particleCount?: number;
  fadeTime?: number;
}

/**
 * Cursor trail effect with fading particles
 */
export function CursorTrail({
  enabled = true,
  color = '#8B5CF6',
  particleCount = 20,
  fadeTime = 500,
}: CursorTrailProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const lastPosition = useRef({ x: 0, y: 0 });
  const idCounter = useRef(0);

  const addPoint = useCallback((x: number, y: number) => {
    const dx = x - lastPosition.current.x;
    const dy = y - lastPosition.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only add point if moved enough
    if (distance < 5) return;

    lastPosition.current = { x, y };

    const newPoint: TrailPoint = {
      id: idCounter.current++,
      x,
      y,
    };

    setTrail(prev => {
      const updated = [...prev, newPoint].slice(-particleCount);
      return updated;
    });

    // Remove point after fade time
    setTimeout(() => {
      setTrail(prev => prev.filter(p => p.id !== newPoint.id));
    }, fadeTime);
  }, [particleCount, fadeTime]);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      addPoint(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled, addPoint]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="absolute rounded-full"
            style={{
              left: point.x,
              top: point.y,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`,
            }}
            initial={{ opacity: 0.8, scale: 1, x: -4, y: -4 }}
            animate={{ opacity: 0, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeTime / 1000 }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                opacity: (index + 1) / trail.length,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Glowing cursor spotlight effect
 */
export function CursorSpotlight({
  enabled = true,
  size = 300,
  color = 'rgba(139, 92, 246, 0.15)',
}: {
  enabled?: boolean;
  size?: number;
  color?: string;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="fixed pointer-events-none z-0 transition-all duration-100 ease-out"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
    />
  );
}

/**
 * Custom animated cursor
 */
export function CustomCursor({ enabled = true }: { enabled?: boolean }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      const isClickable = target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        !!target.closest('button') ||
        !!target.closest('a') ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsPointer(isClickable);
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed pointer-events-none z-50 rounded-full border-2 border-purple-400/50"
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: isPointer ? 1.5 : isPressed ? 0.8 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        style={{ width: 40, height: 40 }}
      />

      {/* Inner dot */}
      <motion.div
        className="fixed pointer-events-none z-50 w-2 h-2 rounded-full bg-purple-400"
        animate={{
          x: position.x - 4,
          y: position.y - 4,
          scale: isPressed ? 0.5 : 1,
        }}
        transition={{ type: 'spring', stiffness: 1000, damping: 28 }}
      />
    </>
  );
}

export default CursorTrail;

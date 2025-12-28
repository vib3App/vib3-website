'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useRhythmSync } from '@/hooks/useAudioRhythm';

interface RhythmVisualizerProps {
  audioRef?: React.RefObject<HTMLAudioElement>;
  className?: string;
  variant?: 'bars' | 'circle' | 'wave' | 'pulse';
}

/**
 * Audio visualizer that syncs with the beat
 */
export function RhythmVisualizer({
  audioRef,
  className = '',
  variant = 'bars',
}: RhythmVisualizerProps) {
  const { connect, analysis, beatInfo, pulseIntensity } = useRhythmSync();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (audioRef?.current) {
      connect(audioRef.current);
    }
  }, [audioRef, connect]);

  // Canvas-based visualizer
  useEffect(() => {
    if (!canvasRef.current || !analysis) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    if (variant === 'bars') {
      const barCount = 32;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const freqIndex = Math.floor((i / barCount) * analysis.frequencies.length);
        const value = analysis.frequencies[freqIndex] / 255;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, `rgba(168, 85, 247, ${value})`);
        gradient.addColorStop(1, `rgba(236, 72, 153, ${value})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(
          i * (barWidth + 2),
          height - value * height,
          barWidth,
          value * height
        );
      }
    } else if (variant === 'circle') {
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) / 4;

      for (let i = 0; i < 64; i++) {
        const freqIndex = Math.floor((i / 64) * analysis.frequencies.length);
        const value = analysis.frequencies[freqIndex] / 255;
        const angle = (i / 64) * Math.PI * 2;
        const radius = baseRadius + value * baseRadius;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        );
        ctx.strokeStyle = `hsla(${270 + value * 60}, 80%, 60%, ${value})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    } else if (variant === 'wave') {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let i = 0; i < analysis.waveform.length; i++) {
        const x = (i / analysis.waveform.length) * width;
        const y = (analysis.waveform[i] / 128) * height / 2;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(168, 85, 247, 0.8)`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [analysis, variant]);

  if (variant === 'pulse') {
    return (
      <div className={`relative ${className}`}>
        <motion.div
          className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          animate={{
            scale: 1 + pulseIntensity * 0.3,
            opacity: 0.5 + pulseIntensity * 0.5,
          }}
          transition={{ duration: 0.1 }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
          {beatInfo.bpm > 0 ? `${beatInfo.bpm} BPM` : '--'}
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={300}
      height={150}
    />
  );
}

/**
 * Beat indicator that pulses with the music
 */
export function BeatIndicator({ className = '' }: { className?: string }) {
  const { beatInfo, pulseIntensity } = useRhythmSync();

  return (
    <motion.div
      className={`flex items-center gap-2 ${className}`}
      animate={{ opacity: beatInfo.bpm > 0 ? 1 : 0.5 }}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
        animate={{
          scale: beatInfo.isBeat ? 1.3 : 1,
          boxShadow: beatInfo.isBeat
            ? '0 0 20px rgba(168, 85, 247, 0.8)'
            : '0 0 0px rgba(168, 85, 247, 0)',
        }}
        transition={{ duration: 0.1 }}
      />
      <div className="text-white/70 text-sm font-mono">
        {beatInfo.bpm > 0 ? (
          <>
            <span className="text-white font-bold">{beatInfo.bpm}</span> BPM
          </>
        ) : (
          <span className="text-white/40">Analyzing...</span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Energy level meter
 */
export function EnergyMeter({ className = '' }: { className?: string }) {
  const { analysis } = useRhythmSync();

  const bass = analysis?.bass || 0;
  const mid = analysis?.mid || 0;
  const high = analysis?.high || 0;

  return (
    <div className={`flex items-end gap-1 h-8 ${className}`}>
      {/* Bass */}
      <motion.div
        className="w-2 bg-red-500 rounded-t"
        animate={{ height: `${bass * 100}%` }}
        transition={{ duration: 0.05 }}
      />
      {/* Mid */}
      <motion.div
        className="w-2 bg-yellow-500 rounded-t"
        animate={{ height: `${mid * 100}%` }}
        transition={{ duration: 0.05 }}
      />
      {/* High */}
      <motion.div
        className="w-2 bg-green-500 rounded-t"
        animate={{ height: `${high * 100}%` }}
        transition={{ duration: 0.05 }}
      />
    </div>
  );
}

/**
 * Rhythm-synced background glow
 */
export function RhythmGlow({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pulseIntensity, getGlowIntensity } = useRhythmSync();

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        filter: `drop-shadow(0 0 ${getGlowIntensity(5, 30)}px rgba(168, 85, 247, ${pulseIntensity}))`,
      }}
    >
      {children}
    </motion.div>
  );
}

export default RhythmVisualizer;

'use client';

import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  audioUrl: string;
  progress: number;
  isPlaying: boolean;
  className?: string;
}

export function WaveformVisualizer({ audioUrl, progress, isPlaying, className }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    // Generate deterministic bars from audioUrl hash
    let hash = 0;
    for (let i = 0; i < audioUrl.length; i++) {
      hash = ((hash << 5) - hash + audioUrl.charCodeAt(i)) | 0;
    }
    const bars: number[] = [];
    for (let i = 0; i < 40; i++) {
      const seed = (hash + i * 17) & 0x7fffffff;
      bars.push(0.2 + (seed % 100) / 125);
    }
    barsRef.current = bars;
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const bars = barsRef.current;
    const barWidth = w / bars.length;
    const gap = 1;

    bars.forEach((bar, i) => {
      const x = i * barWidth;
      const barH = bar * h;
      const y = (h - barH) / 2;
      const progressPos = progress / 100;

      if (i / bars.length <= progressPos) {
        ctx.fillStyle = isPlaying ? '#a855f7' : '#9333ea';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
      }
      ctx.fillRect(x + gap / 2, y, barWidth - gap, barH);
    });
  }, [progress, isPlaying]);

  return <canvas ref={canvasRef} width={160} height={32} className={className} />;
}

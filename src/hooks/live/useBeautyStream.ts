'use client';

import { useEffect, useRef, useState } from 'react';
import { logger } from '@/utils/logger';

export type BeautyPreset = 'soft' | 'glow' | 'cool' | 'warm';

interface BeautyPresetSpec {
  cssFilter: string;
  /** Optional tint overlay drawn on top of the video frame */
  tint?: { color: string; alpha: number };
}

const PRESETS: Record<BeautyPreset, BeautyPresetSpec> = {
  soft: { cssFilter: 'blur(0.4px) brightness(1.05) saturate(1.08) contrast(0.96)' },
  glow: {
    cssFilter: 'brightness(1.08) saturate(1.15) contrast(1.02)',
    tint: { color: 'rgba(255, 220, 200, 1)', alpha: 0.08 },
  },
  cool: {
    cssFilter: 'brightness(1.02) saturate(1.05) contrast(1.04)',
    tint: { color: 'rgba(180, 215, 255, 1)', alpha: 0.06 },
  },
  warm: {
    cssFilter: 'brightness(1.04) saturate(1.1)',
    tint: { color: 'rgba(255, 200, 150, 1)', alpha: 0.07 },
  },
};

/**
 * Take a camera MediaStream and produce a beautified copy by routing
 * each frame through a canvas with a CSS filter + optional tint, then
 * capturing the canvas as a MediaStream. The returned stream can be
 * handed to Agora's `createCustomVideoTrack`.
 *
 * Returns `null` while the source isn't ready or when disabled, so the
 * caller can fall back to the raw camera track.
 */
export function useBeautyStream(
  sourceStream: MediaStream | null,
  enabled: boolean,
  preset: BeautyPreset = 'soft',
): MediaStream | null {
  const [outputStream, setOutputStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !sourceStream || typeof document === 'undefined') return;
    let cancelled = false;
    const canvas = document.createElement('canvas');
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = sourceStream;
    canvasRef.current = canvas;
    videoRef.current = video;

    const spec = PRESETS[preset];

    const renderFrame = () => {
      if (cancelled) return;
      const v = videoRef.current;
      const c = canvasRef.current;
      if (v && c) {
        if (v.videoWidth > 0 && c.width !== v.videoWidth) c.width = v.videoWidth;
        if (v.videoHeight > 0 && c.height !== v.videoHeight) c.height = v.videoHeight;
        const ctx = c.getContext('2d');
        if (ctx && c.width > 0 && c.height > 0) {
          ctx.save();
          ctx.filter = spec.cssFilter;
          ctx.drawImage(v, 0, 0, c.width, c.height);
          ctx.restore();
          if (spec.tint) {
            ctx.save();
            ctx.globalCompositeOperation = 'soft-light';
            ctx.globalAlpha = spec.tint.alpha;
            ctx.fillStyle = spec.tint.color;
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.restore();
          }
        }
      }
      animRef.current = requestAnimationFrame(renderFrame);
    };

    (async () => {
      try {
        await video.play();
        if (cancelled) return;
        animRef.current = requestAnimationFrame(renderFrame);
        const stream = canvas.captureStream(30);
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        setOutputStream(stream);
      } catch (err) {
        logger.error('useBeautyStream start failed:', err);
        if (!cancelled) setOutputStream(null);
      }
    })();

    return () => {
      cancelled = true;
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      try { video.pause(); } catch { /* ignore */ }
      video.srcObject = null;
      videoRef.current = null;
      canvasRef.current = null;
      setOutputStream(prev => {
        prev?.getTracks().forEach(t => t.stop());
        return null;
      });
    };
  }, [enabled, sourceStream, preset]);

  return outputStream;
}

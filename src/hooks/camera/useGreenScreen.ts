'use client';

import { useEffect, useRef, useState } from 'react';
import { logger } from '@/utils/logger';

interface UseGreenScreenOptions {
  sourceStream: MediaStream | null;
  enabled: boolean;
  /** Hex color (e.g. '#00ff00') of the key color to remove. */
  keyColor?: string;
  /** 0–100, larger = more tolerant chroma match. */
  sensitivity?: number;
  /** CSS color OR background image source the user has chosen. */
  background?: { type: 'color'; value: string } | { type: 'image'; src: string };
}

const DEFAULT_KEY = '#00ff00';
const DEFAULT_SENS = 40;

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const v = normalized.length === 3
    ? normalized.split('').map(c => c + c).join('')
    : normalized.padEnd(6, '0');
  const r = parseInt(v.slice(0, 2), 16) || 0;
  const g = parseInt(v.slice(2, 4), 16) || 0;
  const b = parseInt(v.slice(4, 6), 16) || 0;
  return [r, g, b];
}

/**
 * Pipe a camera MediaStream through a canvas that replaces the key color
 * with the chosen background each frame. Returns a captured MediaStream that
 * downstream code (live preview, MediaRecorder) can consume.
 *
 * Pure 2D canvas + ImageData for breadth of device support. Resolution is
 * deliberately modest (the camera tracks already constrain this) so the
 * per-frame pixel loop stays under ~16 ms on mid-range hardware.
 */
export function useGreenScreen({
  sourceStream,
  enabled,
  keyColor = DEFAULT_KEY,
  sensitivity = DEFAULT_SENS,
  background,
}: UseGreenScreenOptions): MediaStream | null {
  const [output, setOutput] = useState<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !sourceStream || typeof document === 'undefined') return;
    let cancelled = false;

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = sourceStream;

    const fg = document.createElement('canvas');
    const bgCanvas = document.createElement('canvas');
    const composite = document.createElement('canvas');

    const [keyR, keyG, keyB] = hexToRgb(keyColor);
    // Squared distance threshold; map 0..100 sensitivity to 0..200 channel-distance.
    const distThreshold = ((sensitivity / 100) * 200) ** 2;

    const bgImage = (() => {
      if (background?.type === 'image' && background.src) {
        const img = document.createElement('img') as HTMLImageElement;
        img.crossOrigin = 'anonymous';
        img.src = background.src;
        return img;
      }
      return null;
    })();

    const drawBackground = (width: number, height: number) => {
      const bctx = bgCanvas.getContext('2d');
      if (!bctx) return;
      if (bgCanvas.width !== width) bgCanvas.width = width;
      if (bgCanvas.height !== height) bgCanvas.height = height;
      if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
        // cover-fit the background
        const scale = Math.max(width / bgImage.naturalWidth, height / bgImage.naturalHeight);
        const drawW = bgImage.naturalWidth * scale;
        const drawH = bgImage.naturalHeight * scale;
        bctx.drawImage(bgImage, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
      } else {
        bctx.fillStyle = background?.type === 'color' ? background.value : '#000000';
        bctx.fillRect(0, 0, width, height);
      }
    };

    const renderFrame = () => {
      if (cancelled) return;
      animRef.current = requestAnimationFrame(renderFrame);
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w === 0 || h === 0) return;

      if (fg.width !== w) fg.width = w;
      if (fg.height !== h) fg.height = h;
      if (composite.width !== w) composite.width = w;
      if (composite.height !== h) composite.height = h;

      const fctx = fg.getContext('2d', { willReadFrequently: true });
      const cctx = composite.getContext('2d');
      if (!fctx || !cctx) return;

      // Draw raw video into fg, read pixels, replace keyed pixels with alpha 0.
      fctx.drawImage(video, 0, 0, w, h);
      const imgData = fctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - keyR;
        const dg = data[i + 1] - keyG;
        const db = data[i + 2] - keyB;
        if (dr * dr + dg * dg + db * db < distThreshold) {
          data[i + 3] = 0; // transparent
        }
      }
      fctx.putImageData(imgData, 0, 0);

      // Composite over the background.
      drawBackground(w, h);
      cctx.drawImage(bgCanvas, 0, 0, w, h);
      cctx.drawImage(fg, 0, 0, w, h);
    };

    (async () => {
      try {
        await video.play();
        if (cancelled) return;
        animRef.current = requestAnimationFrame(renderFrame);
        const stream = composite.captureStream(30);
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        setOutput(stream);
      } catch (err) {
        logger.error('useGreenScreen start failed:', err);
        if (!cancelled) setOutput(null);
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
      setOutput(prev => {
        prev?.getTracks().forEach(t => t.stop());
        return null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sourceStream, keyColor, sensitivity, JSON.stringify(background ?? null)]);

  return output;
}

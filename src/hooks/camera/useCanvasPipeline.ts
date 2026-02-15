'use client';

import { useRef, useCallback } from 'react';

/**
 * Manages the canvas-based recording pipeline for applying
 * CSS filters and particle effects to video frames.
 */
export function useCanvasPipeline() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopCanvasPipeline = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    canvasRef.current = null;
  }, []);

  /**
   * Start a canvas draw loop that composites filtered video + particle effects.
   * Returns the canvas so a capture stream can be obtained.
   */
  const startCanvasPipeline = useCallback((
    video: HTMLVideoElement,
    activeFilter: string,
    effectsCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d')!;
    const hasFilter = activeFilter && activeFilter !== 'none';

    const draw = () => {
      if (!canvasRef.current) return;

      if (hasFilter) {
        ctx.save();
        ctx.filter = activeFilter;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      const effCanvas = effectsCanvasRef.current;
      if (effCanvas && effCanvas.width > 0 && effCanvas.height > 0) {
        ctx.drawImage(effCanvas, 0, 0, canvas.width, canvas.height);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return canvas;
  }, []);

  return { canvasRef, stopCanvasPipeline, startCanvasPipeline };
}

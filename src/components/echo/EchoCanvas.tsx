'use client';

import { useEffect, useRef } from 'react';
import type { EchoLayout } from '@/hooks/useEchoRecorder';

interface EchoCanvasProps {
  originalVideo: HTMLVideoElement | null;
  cameraVideo: HTMLVideoElement | null;
  layout: EchoLayout;
  width?: number;
  height?: number;
}

export function EchoCanvas({ originalVideo, cameraVideo, layout, width = 720, height = 1280 }: EchoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalVideo || !cameraVideo) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const draw = () => {
      switch (layout) {
        case 'side-by-side':
          ctx.drawImage(originalVideo, 0, 0, width / 2, height);
          ctx.drawImage(cameraVideo, width / 2, 0, width / 2, height);
          break;
        case 'top-bottom':
          ctx.drawImage(originalVideo, 0, 0, width, height / 2);
          ctx.drawImage(cameraVideo, 0, height / 2, width, height / 2);
          break;
        case 'picture-in-picture':
          ctx.drawImage(originalVideo, 0, 0, width, height);
          const pipW = width * 0.3;
          const pipH = height * 0.3;
          ctx.drawImage(cameraVideo, width - pipW - 20, height - pipH - 20, pipW, pipH);
          break;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [originalVideo, cameraVideo, layout, width, height]);

  return <canvas ref={canvasRef} className="hidden" />;
}

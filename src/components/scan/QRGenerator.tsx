'use client';

import { useEffect, useRef } from 'react';

interface QRGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRGenerator({ value, size = 200, className }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple QR-like pattern as placeholder — real QR generation would use a library
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Encode value into visual pattern
    const moduleSize = Math.floor(size / 25);
    const padding = Math.floor((size - moduleSize * 25) / 2);

    // Generate deterministic pattern from value
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
    }

    ctx.fillStyle = '#000000';

    // Corner markers (finder patterns)
    const drawFinder = (x: number, y: number) => {
      ctx.fillRect(padding + x * moduleSize, padding + y * moduleSize, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(padding + (x + 1) * moduleSize, padding + (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect(padding + (x + 2) * moduleSize, padding + (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };

    drawFinder(0, 0);
    drawFinder(18, 0);
    drawFinder(0, 18);

    // Data modules
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Skip finder pattern areas
        if ((row < 8 && col < 8) || (row < 8 && col > 16) || (row > 16 && col < 8)) continue;

        const seed = (hash + row * 31 + col * 37) & 0x7fffffff;
        if (seed % 3 === 0) {
          ctx.fillRect(padding + col * moduleSize, padding + row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }, [value, size]);

  return <canvas ref={canvasRef} className={className} style={{ imageRendering: 'pixelated' }} />;
}

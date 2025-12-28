'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface VideoColors {
  dominant: string;
  vibrant: string;
  muted: string;
  background: string;
}

const defaultColors: VideoColors = {
  dominant: '#8B5CF6',
  vibrant: '#14B8A6',
  muted: '#1a1a2e',
  background: '#0a0a1b',
};

/**
 * Extract dominant colors from a video element
 */
export function useVideoColors(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean = true
) {
  const [colors, setColors] = useState<VideoColors>(defaultColors);
  const [isExtracting, setIsExtracting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const extractColors = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused || video.ended || !enabled) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Use a small sample size for performance
    const sampleSize = 32;
    canvas.width = sampleSize;
    canvas.height = sampleSize;

    try {
      ctx.drawImage(video, 0, 0, sampleSize, sampleSize);
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const pixels = imageData.data;

      // Simple color extraction - find dominant and vibrant colors
      const colorCounts: { [key: string]: number } = {};
      let maxCount = 0;
      let dominantColor = defaultColors.dominant;
      let vibrantColor = defaultColors.vibrant;
      let maxSaturation = 0;

      for (let i = 0; i < pixels.length; i += 16) { // Sample every 4th pixel
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Skip very dark or very light pixels
        const brightness = (r + g + b) / 3;
        if (brightness < 30 || brightness > 225) continue;

        // Quantize colors for grouping
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;
        const key = `${qr},${qg},${qb}`;

        colorCounts[key] = (colorCounts[key] || 0) + 1;

        if (colorCounts[key] > maxCount) {
          maxCount = colorCounts[key];
          dominantColor = `rgb(${qr}, ${qg}, ${qb})`;
        }

        // Find most saturated color for vibrant
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;

        if (saturation > maxSaturation && saturation > 0.3) {
          maxSaturation = saturation;
          vibrantColor = `rgb(${r}, ${g}, ${b})`;
        }
      }

      // Create muted version (desaturated, darker)
      const mutedColor = dominantColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, (_, r, g, b) => {
        const avg = (parseInt(r) + parseInt(g) + parseInt(b)) / 3;
        const mr = Math.round(parseInt(r) * 0.3 + avg * 0.2);
        const mg = Math.round(parseInt(g) * 0.3 + avg * 0.2);
        const mb = Math.round(parseInt(b) * 0.3 + avg * 0.2);
        return `rgb(${mr}, ${mg}, ${mb})`;
      });

      setColors({
        dominant: dominantColor,
        vibrant: vibrantColor,
        muted: mutedColor,
        background: `rgba(${dominantColor.match(/\d+/g)?.slice(0, 3).join(', ')}, 0.15)`,
      });
    } catch {
      // Canvas tainted or other error - use defaults
    }

    setIsExtracting(false);
  }, [videoRef, enabled]);

  // Extract colors periodically while playing
  useEffect(() => {
    if (!enabled) return;

    const video = videoRef.current;
    if (!video) return;

    let lastExtraction = 0;
    const extractionInterval = 1000; // Extract every second

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastExtraction > extractionInterval) {
        lastExtraction = now;
        setIsExtracting(true);
        // Use requestAnimationFrame for smooth extraction
        animationRef.current = requestAnimationFrame(extractColors);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', extractColors);
    video.addEventListener('seeked', extractColors);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', extractColors);
      video.removeEventListener('seeked', extractColors);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [videoRef, enabled, extractColors]);

  return { colors, isExtracting };
}

export default useVideoColors;

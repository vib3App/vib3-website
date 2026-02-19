'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ZoomConfig {
  streamRef: React.RefObject<MediaStream | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useCameraZoom({ streamRef, videoRef }: ZoomConfig) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [zoomSupported, setZoomSupported] = useState(false);

  const lastTouchDistRef = useRef<number | null>(null);

  // Detect zoom support when stream changes
  useEffect(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    const capabilities = track.getCapabilities?.();
    if (capabilities && 'zoom' in capabilities) {
      const zoomCap = capabilities.zoom as { min: number; max: number };
      setZoomSupported(true);
      setMaxZoom(Math.min(zoomCap.max, 8));
      setZoomLevel(zoomCap.min || 1);
    } else {
      setZoomSupported(false);
      setMaxZoom(1);
    }
  }, [streamRef]);

  const applyZoom = useCallback(async (level: number) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track || !zoomSupported) return;

    const clamped = Math.max(1, Math.min(level, maxZoom));
    try {
      await track.applyConstraints({ advanced: [{ zoom: clamped } as MediaTrackConstraintSet] });
      setZoomLevel(clamped);
    } catch {
      // Zoom not supported on this track
    }
  }, [streamRef, zoomSupported, maxZoom]);

  const setPresetZoom = useCallback((preset: number) => {
    applyZoom(preset);
  }, [applyZoom]);

  // Pinch-to-zoom touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistRef.current = Math.hypot(dx, dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);

      const scale = dist / lastTouchDistRef.current;
      const newZoom = zoomLevel * scale;
      applyZoom(newZoom);
      lastTouchDistRef.current = dist;
    }
  }, [zoomLevel, applyZoom]);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistRef.current = null;
  }, []);

  // Reset zoom (e.g., on camera flip)
  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    applyZoom(1);
  }, [applyZoom]);

  // Available zoom presets based on max zoom
  const zoomPresets = [1];
  if (maxZoom >= 2) zoomPresets.push(2);
  if (maxZoom >= 3) zoomPresets.push(3);
  if (maxZoom >= 5) zoomPresets.push(5);

  return {
    zoomLevel,
    maxZoom,
    zoomSupported,
    zoomPresets,
    setPresetZoom,
    applyZoom,
    resetZoom,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

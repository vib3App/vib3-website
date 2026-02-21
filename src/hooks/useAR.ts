'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/utils/logger';

interface ARCapabilities {
  isSupported: boolean;
  hasCamera: boolean;
  hasMotion: boolean;
  hasWebXR: boolean;
}

interface FaceFilter {
  id: string;
  name: string;
  type: 'mask' | 'overlay' | 'effect' | 'beauty';
  intensity: number;
}

interface ARSession {
  isActive: boolean;
  filter: FaceFilter | null;
  cameraStream: MediaStream | null;
}

// CSS filter strings per preset
const FILTER_CSS: Record<string, string> = {
  glow: 'brightness(1.2) saturate(1.4) contrast(1.1)',
  beauty: 'blur(0.5px) brightness(1.05) saturate(1.1) contrast(0.95)',
  sparkle: 'brightness(1.1) saturate(1.2)',
  vintage: 'sepia(0.4) contrast(1.1) brightness(0.9) saturate(0.8)',
  hologram: 'hue-rotate(180deg) brightness(1.3) contrast(0.8)',
};

// Emoji overlays for face-positioned filters
const FILTER_EMOJI: Record<string, { emoji: string; yFactor: number }> = {
  glasses: { emoji: '🕶️', yFactor: 0.4 },
  crown: { emoji: '👑', yFactor: 0.22 },
  mask: { emoji: '🐱', yFactor: 0.4 },
};

/** Draw filter-specific post-processing overlays */
function drawFilterOverlay(
  ctx: CanvasRenderingContext2D,
  filter: FaceFilter,
  w: number,
  h: number,
) {
  const { id, intensity } = filter;

  // Emoji-based overlays (glasses, crown, mask)
  const emojiDef = FILTER_EMOJI[id];
  if (emojiDef) {
    const size = Math.min(w, h) * 0.25;
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emojiDef.emoji, w / 2, h * emojiDef.yFactor);
    return;
  }

  switch (id) {
    case 'glow': {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(168, 85, 247, ${intensity * 0.15})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      break;
    }
    case 'beauty': {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = `rgba(255, 200, 180, ${intensity * 0.1})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      break;
    }
    case 'sparkle': {
      ctx.save();
      const t = Date.now();
      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(t * 0.001 + i * 1.7) * 0.5 + 0.5) * w;
        const y = (Math.cos(t * 0.0013 + i * 2.3) * 0.5 + 0.5) * h;
        const alpha = (Math.sin(t * 0.003 + i) * 0.5 + 0.5) * intensity;
        const r = 2 + Math.sin(t * 0.002 + i * 3) * 2;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - r * 2, y); ctx.lineTo(x + r * 2, y);
        ctx.moveTo(x, y - r * 2); ctx.lineTo(x, y + r * 2);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }
    case 'vintage': {
      ctx.save();
      const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, `rgba(0,0,0,${intensity * 0.4})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      break;
    }
    case 'hologram': {
      ctx.save();
      ctx.fillStyle = 'rgba(0,255,255,0.03)';
      const spacing = 4;
      const off = (Date.now() * 0.05) % spacing;
      for (let sy = off; sy < h; sy += spacing) {
        ctx.fillRect(0, sy, w, 1);
      }
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(255,0,0,${intensity * 0.05})`;
      ctx.fillRect(2, 0, w, h);
      ctx.fillStyle = `rgba(0,0,255,${intensity * 0.05})`;
      ctx.fillRect(-2, 0, w, h);
      ctx.restore();
      break;
    }
  }
}

/**
 * Hook for AR camera with real-time canvas filter rendering.
 * Uses requestAnimationFrame to composite video + filter effects.
 */
export function useAR() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [capabilities, setCapabilities] = useState<ARCapabilities>({
    isSupported: false, hasCamera: false, hasMotion: false, hasWebXR: false,
  });

  const [session, setSession] = useState<ARSession>({
    isActive: false, filter: null, cameraStream: null,
  });

  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  // Check device capabilities
  useEffect(() => {
    const check = async () => {
      const caps: ARCapabilities = {
        isSupported: false, hasCamera: false, hasMotion: false, hasWebXR: false,
      };
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        caps.hasCamera = devices.some(d => d.kind === 'videoinput');
      } catch { /* no camera access */ }
      caps.hasMotion = 'DeviceMotionEvent' in window;
      if ('xr' in navigator) {
        try {
          caps.hasWebXR = await (navigator as Navigator & {
            xr: { isSessionSupported: (m: string) => Promise<boolean> };
          }).xr.isSessionSupported('immersive-ar');
        } catch { /* no webxr */ }
      }
      caps.isSupported = caps.hasCamera;
      setCapabilities(caps);
    };
    check();
  }, []);

  // --- Canvas render loop ---
  const startRenderLoop = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }
    const render = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const filter = sessionRef.current.filter;
      if (!canvas || !video || !filter || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;

      // Draw video frame with CSS filter
      const cssFilter = FILTER_CSS[filter.id];
      if (cssFilter) {
        ctx.save();
        ctx.filter = cssFilter;
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, w, h);
      }

      // Draw filter-specific overlay
      drawFilterOverlay(ctx, filter, w, h);

      animFrameRef.current = requestAnimationFrame(render);
    };
    render();
  }, []);

  const stopRenderLoop = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!capabilities.hasCamera) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setSession(prev => ({ ...prev, isActive: true, cameraStream: stream }));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (e) {
      logger.error('Failed to start camera:', e);
      return false;
    }
  }, [capabilities.hasCamera]);

  const stopCamera = useCallback(() => {
    stopRenderLoop();
    sessionRef.current.cameraStream?.getTracks().forEach(t => t.stop());
    setSession({ isActive: false, filter: null, cameraStream: null });
  }, [stopRenderLoop]);

  // Apply filter — starts the real-time render loop
  const applyFilter = useCallback((filter: FaceFilter) => {
    setSession(prev => ({ ...prev, filter }));
    sessionRef.current = { ...sessionRef.current, filter };
    startRenderLoop();
  }, [startRenderLoop]);

  const removeFilter = useCallback(() => {
    stopRenderLoop();
    setSession(prev => ({ ...prev, filter: null }));
  }, [stopRenderLoop]);

  // Capture photo — uses rendered canvas when filter is active
  const capturePhoto = useCallback((): string | null => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return null;

    if (sessionRef.current.filter && animFrameRef.current !== null) {
      // Canvas already has the latest filtered frame
      return canvas.toDataURL('image/jpeg', 0.9);
    }

    // No filter — capture directly from video
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
      sessionRef.current.cameraStream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return {
    capabilities, session, videoRef, canvasRef,
    startCamera, stopCamera, applyFilter, removeFilter, capturePhoto,
    isFilterActive: session.filter !== null,
  };
}

// Preset filters
export const arFilters: FaceFilter[] = [
  { id: 'glow', name: 'Neon Glow', type: 'effect', intensity: 0.7 },
  { id: 'beauty', name: 'Beauty', type: 'beauty', intensity: 0.5 },
  { id: 'glasses', name: 'Cool Glasses', type: 'overlay', intensity: 1 },
  { id: 'crown', name: 'Crown', type: 'overlay', intensity: 1 },
  { id: 'mask', name: 'Animal Mask', type: 'mask', intensity: 1 },
  { id: 'sparkle', name: 'Sparkle', type: 'effect', intensity: 0.8 },
  { id: 'vintage', name: 'Vintage', type: 'effect', intensity: 0.6 },
  { id: 'hologram', name: 'Hologram', type: 'effect', intensity: 0.9 },
];

/**
 * Hook for motion-based interactions
 */
export function useMotionControls() {
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [isEnabled, setIsEnabled] = useState(false);

  const enable = useCallback(async () => {
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (permission !== 'granted') return false;
      } catch { return false; }
    }
    setIsEnabled(true);
    return true;
  }, []);

  useEffect(() => {
    if (!isEnabled) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      setOrientation({ alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 });
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isEnabled]);

  return { orientation, isEnabled, enable };
}

export default useAR;

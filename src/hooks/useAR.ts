'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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

/**
 * Hook for AR-ready functionality
 * Prepares for WebXR and AR filters
 */
export function useAR() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [capabilities, setCapabilities] = useState<ARCapabilities>({
    isSupported: false,
    hasCamera: false,
    hasMotion: false,
    hasWebXR: false,
  });

  const [session, setSession] = useState<ARSession>({
    isActive: false,
    filter: null,
    cameraStream: null,
  });

  // Check device capabilities
  useEffect(() => {
    const checkCapabilities = async () => {
      const caps: ARCapabilities = {
        isSupported: false,
        hasCamera: false,
        hasMotion: false,
        hasWebXR: false,
      };

      // Check camera
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        caps.hasCamera = devices.some(d => d.kind === 'videoinput');
      } catch (e) {
        // No camera access
      }

      // Check motion sensors
      caps.hasMotion = 'DeviceMotionEvent' in window;

      // Check WebXR
      if ('xr' in navigator) {
        try {
          caps.hasWebXR = await (navigator as Navigator & { xr: { isSessionSupported: (mode: string) => Promise<boolean> } })
            .xr.isSessionSupported('immersive-ar');
        } catch (e) {
          // WebXR not available
        }
      }

      caps.isSupported = caps.hasCamera;
      setCapabilities(caps);
    };

    checkCapabilities();
  }, []);

  // Start camera for AR
  const startCamera = useCallback(async () => {
    if (!capabilities.hasCamera) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setSession(prev => ({
        ...prev,
        isActive: true,
        cameraStream: stream,
      }));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      return true;
    } catch (e) {
      console.error('Failed to start camera:', e);
      return false;
    }
  }, [capabilities.hasCamera]);

  // Stop camera
  const stopCamera = useCallback(() => {
    session.cameraStream?.getTracks().forEach(track => track.stop());
    setSession({
      isActive: false,
      filter: null,
      cameraStream: null,
    });
  }, [session.cameraStream]);

  // Apply filter (placeholder for actual AR filter implementation)
  const applyFilter = useCallback((filter: FaceFilter) => {
    setSession(prev => ({ ...prev, filter }));
    // In real implementation, would apply WebGL shader or ML model
  }, []);

  // Remove filter
  const removeFilter = useCallback(() => {
    setSession(prev => ({ ...prev, filter: null }));
  }, []);

  // Take photo with filter
  const capturePhoto = useCallback((): string | null => {
    if (!canvasRef.current || !videoRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Apply filter overlay if active
    if (session.filter) {
      // Placeholder for filter application
      ctx.fillStyle = `rgba(168, 85, 247, ${session.filter.intensity * 0.1})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  }, [session.filter]);

  // Cleanup
  useEffect(() => {
    return () => {
      session.cameraStream?.getTracks().forEach(track => track.stop());
    };
  }, [session.cameraStream]);

  return {
    capabilities,
    session,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    applyFilter,
    removeFilter,
    capturePhoto,
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
    // Request permission on iOS 13+
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (permission !== 'granted') return false;
      } catch (e) {
        return false;
      }
    }

    setIsEnabled(true);
    return true;
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      setOrientation({
        alpha: e.alpha || 0,
        beta: e.beta || 0,
        gamma: e.gamma || 0,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isEnabled]);

  return { orientation, isEnabled, enable };
}

export default useAR;

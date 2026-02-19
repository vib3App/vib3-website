'use client';

import { useState, useRef, useCallback } from 'react';
import type { PhotoMode, CollageLayout } from './types';

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}

interface PhotoConfig {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraKitCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraKitActive: boolean;
  activeFilter: string;
  cameraFacing: 'user' | 'environment';
}

export function useCameraPhoto({
  videoRef, cameraKitCanvasRef, isCameraKitActive, activeFilter, cameraFacing,
}: PhotoConfig) {
  const [photoMode, setPhotoMode] = useState<PhotoMode>('single');
  const [collageLayout, setCollageLayout] = useState<CollageLayout>('2x2');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [collagePhotos, setCollagePhotos] = useState<CapturedPhoto[]>([]);

  const burstTimerRef = useRef<NodeJS.Timeout | null>(null);

  const captureFrame = useCallback((): string | null => {
    const canvas = document.createElement('canvas');
    let source: HTMLVideoElement | HTMLCanvasElement | null = null;

    if (isCameraKitActive && cameraKitCanvasRef.current) {
      source = cameraKitCanvasRef.current;
      canvas.width = source.width || 1080;
      canvas.height = source.height || 1920;
    } else if (videoRef.current) {
      source = videoRef.current;
      canvas.width = source.videoWidth || 1080;
      canvas.height = source.videoHeight || 1920;
    }

    if (!source) return null;

    const ctx = canvas.getContext('2d')!;

    // Apply mirror for front camera (non-CK only)
    if (!isCameraKitActive && cameraFacing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Apply CSS filter
    if (!isCameraKitActive && activeFilter && activeFilter !== 'none') {
      ctx.filter = activeFilter;
    }

    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [videoRef, cameraKitCanvasRef, isCameraKitActive, activeFilter, cameraFacing]);

  const takePhoto = useCallback(() => {
    const dataUrl = captureFrame();
    if (!dataUrl) return;

    const photo: CapturedPhoto = {
      id: `photo-${Date.now()}`,
      dataUrl,
      timestamp: Date.now(),
    };
    setCapturedPhotos(prev => [photo, ...prev]);
  }, [captureFrame]);

  const takeBurst = useCallback(() => {
    if (isBurstActive) return;
    setIsBurstActive(true);

    let count = 0;
    const maxBurst = 10;

    burstTimerRef.current = setInterval(() => {
      const dataUrl = captureFrame();
      if (dataUrl) {
        const photo: CapturedPhoto = {
          id: `burst-${Date.now()}-${count}`,
          dataUrl,
          timestamp: Date.now(),
        };
        setCapturedPhotos(prev => [photo, ...prev]);
      }
      count++;
      if (count >= maxBurst) {
        if (burstTimerRef.current) clearInterval(burstTimerRef.current);
        setIsBurstActive(false);
      }
    }, 200);
  }, [captureFrame, isBurstActive]);

  const takeCollagePhoto = useCallback(() => {
    const maxPhotos = collageLayout === '2x2' ? 4 : 9;
    if (collagePhotos.length >= maxPhotos) return;

    const dataUrl = captureFrame();
    if (!dataUrl) return;

    const photo: CapturedPhoto = {
      id: `collage-${Date.now()}`,
      dataUrl,
      timestamp: Date.now(),
    };

    const updated = [...collagePhotos, photo];
    setCollagePhotos(updated);

    // When collage is complete, merge into a single image
    if (updated.length >= maxPhotos) {
      mergeCollage(updated, collageLayout);
    }
  }, [captureFrame, collagePhotos, collageLayout]);

  const mergeCollage = useCallback((photos: CapturedPhoto[], layout: CollageLayout) => {
    const cols = layout === '2x2' ? 2 : 3;
    const cellSize = 540;
    const totalSize = cols * cellSize;

    const canvas = document.createElement('canvas');
    canvas.width = totalSize;
    canvas.height = totalSize;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, totalSize, totalSize);

    let loaded = 0;
    photos.forEach((photo, i) => {
      const img = new Image();
      img.onload = () => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        ctx.drawImage(img, col * cellSize, row * cellSize, cellSize, cellSize);
        loaded++;
        if (loaded === photos.length) {
          const collageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const collagePhoto: CapturedPhoto = {
            id: `collage-merged-${Date.now()}`,
            dataUrl: collageDataUrl,
            timestamp: Date.now(),
          };
          setCapturedPhotos(prev => [collagePhoto, ...prev]);
          setCollagePhotos([]);
        }
      };
      img.src = photo.dataUrl;
    });
  }, []);

  const handleShutter = useCallback(() => {
    switch (photoMode) {
      case 'single':
        takePhoto();
        break;
      case 'burst':
        takeBurst();
        break;
      case 'collage':
        takeCollagePhoto();
        break;
    }
  }, [photoMode, takePhoto, takeBurst, takeCollagePhoto]);

  const downloadPhoto = useCallback((photo: CapturedPhoto) => {
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    a.download = `vib3-photo-${Date.now()}.jpg`;
    a.click();
  }, []);

  const deletePhoto = useCallback((photoId: string) => {
    setCapturedPhotos(prev => prev.filter(p => p.id !== photoId));
  }, []);

  const clearPhotos = useCallback(() => {
    setCapturedPhotos([]);
    setCollagePhotos([]);
  }, []);

  const resetCollage = useCallback(() => {
    setCollagePhotos([]);
  }, []);

  return {
    photoMode,
    setPhotoMode,
    collageLayout,
    setCollageLayout,
    capturedPhotos,
    collagePhotos,
    collageTarget: collageLayout === '2x2' ? 4 : 9,
    isBurstActive,
    handleShutter,
    downloadPhoto,
    deletePhoto,
    clearPhotos,
    resetCollage,
  };
}

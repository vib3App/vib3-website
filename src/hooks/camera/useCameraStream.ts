'use client';

import { useState, useRef, useCallback } from 'react';
import type { CameraFacing } from './types';
import { logger } from '@/utils/logger';

export function useCameraStream() {
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>('user');
  const [flashOn, setFlashOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities?.();
        const hasTorch = capabilities && 'torch' in capabilities;
        setTorchSupported(!!hasTorch);
        setFlashOn(false);
      }

      setError(null);
    } catch (err) {
      logger.error('Failed to access camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, [cameraFacing]);

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const flipCamera = useCallback(() => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  const toggleFlash = useCallback(async () => {
    if (!streamRef.current || !torchSupported) return;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const newFlashState = !flashOn;
      await videoTrack.applyConstraints({
        advanced: [{ torch: newFlashState } as MediaTrackConstraintSet],
      });
      setFlashOn(newFlashState);
    } catch (err) {
      logger.error('Failed to toggle flash:', err);
    }
  }, [flashOn, torchSupported]);

  return {
    cameraFacing,
    flashOn,
    torchSupported,
    error,
    videoRef,
    streamRef,
    initCamera,
    cleanup,
    flipCamera,
    toggleFlash,
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useCameraStream } from './useCameraStream';
import { useCameraRecording } from './useCameraRecording';
import { useParticleEffects } from './useParticleEffects';
import { CAMERA_FILTERS } from './types';

export function useCamera() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthVerified = useAuthStore((s) => s.isAuthVerified);

  const [selectedFilter, setSelectedFilter] = useState(0);
  const [selectedEffect, setSelectedEffect] = useState(0);
  const [selectedSpeed, setSelectedSpeed] = useState(2);
  const [maxDuration] = useState(180);
  const [showFilters, setShowFilters] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);

  const stream = useCameraStream();
  const activeFilter = CAMERA_FILTERS[selectedFilter]?.filter || 'none';
  const effects = useParticleEffects(selectedEffect);
  const recording = useCameraRecording({
    streamRef: stream.streamRef,
    videoRef: stream.videoRef,
    effectsCanvasRef: effects.effectsCanvasRef,
    maxDuration,
    selectedSpeed,
    activeFilter,
  });

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/camera');
      return;
    }
    stream.initCamera();
    return () => {
      stream.cleanup();
      recording.cleanupTimer();
    };
  }, [isAuthenticated, isAuthVerified, router, stream, recording]);

  const togglePanel = useCallback((panel: 'filters' | 'effects' | 'speed') => {
    setShowFilters(panel === 'filters' ? !showFilters : false);
    setShowEffects(panel === 'effects' ? !showEffects : false);
    setShowSpeed(panel === 'speed' ? !showSpeed : false);
  }, [showFilters, showEffects, showSpeed]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleNext = useCallback(() => {
    const blob = recording.getRecordedBlob();
    if (blob && recording.previewUrl) {
      sessionStorage.setItem('recordedVideoUrl', recording.previewUrl);
      router.push('/upload?from=camera');
    }
  }, [recording, router]);

  return {
    isAuthenticated,
    isAuthVerified,
    recordingState: recording.recordingState,
    cameraFacing: stream.cameraFacing,
    selectedFilter,
    setSelectedFilter,
    selectedEffect,
    setSelectedEffect,
    selectedSpeed,
    setSelectedSpeed,
    recordingDuration: recording.recordingDuration,
    maxDuration,
    flashOn: stream.flashOn,
    torchSupported: stream.torchSupported,
    toggleFlash: stream.toggleFlash,
    timerMode: recording.timerMode,
    countdown: recording.countdown,
    showFilters,
    showEffects,
    showSpeed,
    previewUrl: recording.previewUrl,
    error: stream.error,
    videoRef: stream.videoRef,
    previewVideoRef: recording.previewVideoRef,
    effectsCanvasRef: effects.effectsCanvasRef,
    flipCamera: stream.flipCamera,
    handleRecordButton: recording.handleRecordButton,
    pauseRecording: recording.pauseRecording,
    discardRecording: recording.discardRecording,
    handleNext,
    formatTime,
    togglePanel,
    cycleTimer: recording.cycleTimer,
    goBack: () => router.back(),
    goToUpload: () => router.push('/upload'),
    // Multi-clip support
    clipCount: recording.clipCount,
    recordedClips: recording.recordedClips,
    totalClipsDuration: recording.totalClipsDuration,
    remainingDuration: recording.remainingDuration,
    canAddMoreClips: recording.canAddMoreClips,
    isCombining: recording.isCombining,
    mergeProgress: recording.mergeProgress,
    removeLastClip: recording.removeLastClip,
    discardAllClips: recording.discardAllClips,
    goToPreview: recording.goToPreview,
  };
}

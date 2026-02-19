'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useCameraStream } from './useCameraStream';
import { useCameraRecording } from './useCameraRecording';
import { useParticleEffects } from './useParticleEffects';
import { useCameraKit } from './useCameraKit';
import { useCameraPhoto } from './useCameraPhoto';
import { useCameraZoom } from './useCameraZoom';
import { useHandsFree } from './useHandsFree';
import { useSmileDetection } from './useSmileDetection';
import { useTemplateRecording } from './useTemplateRecording';
import { useChallengeCamera } from './useChallengeCamera';
import { useDMRecording } from './useDMRecording';
import { useClipOnlyMode } from './useClipOnlyMode';
import { CAMERA_FILTERS } from './types';
import type { CameraMode } from './types';

export type PanelName = 'filters' | 'effects' | 'speed' | 'lenses' | 'duration' | 'effectCategories' | 'templates';

export function useCamera() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthVerified = useAuthStore((s) => s.isAuthVerified);

  const [cameraMode, setCameraMode] = useState<CameraMode>('video');
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [selectedEffect, setSelectedEffect] = useState(0);
  const [selectedSpeed, setSelectedSpeed] = useState(2);
  const [maxDuration, setMaxDuration] = useState(180);
  const [showFilters, setShowFilters] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showLenses, setShowLenses] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showEffectCategories, setShowEffectCategories] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  const stream = useCameraStream();
  const activeFilter = CAMERA_FILTERS[selectedFilter]?.filter || 'none';
  const effects = useParticleEffects(selectedEffect);
  const cameraKit = useCameraKit();
  const zoom = useCameraZoom({ streamRef: stream.streamRef, videoRef: stream.videoRef });

  // Gap 5: Challenge-aware camera
  const challenge = useChallengeCamera();
  // Gap 6: DM recording mode
  const dm = useDMRecording();
  // Gap 7: Clip-only mode
  const clipOnly = useClipOnlyMode();
  // Gap 4: Template recording
  const template = useTemplateRecording();

  // Apply challenge duration constraint
  useEffect(() => {
    if (challenge.isActive && challenge.maxDuration) {
      setMaxDuration(challenge.maxDuration);
    }
  }, [challenge.isActive, challenge.maxDuration]);

  const photo = useCameraPhoto({
    videoRef: stream.videoRef,
    cameraKitCanvasRef: cameraKit.canvasRef,
    isCameraKitActive: cameraKit.isCameraKitActive,
    activeFilter,
    cameraFacing: stream.cameraFacing,
  });

  const recording = useCameraRecording({
    streamRef: stream.streamRef,
    videoRef: stream.videoRef,
    effectsCanvasRef: effects.effectsCanvasRef,
    cameraKitCanvasRef: cameraKit.canvasRef,
    isCameraKitActive: cameraKit.isCameraKitActive,
    maxDuration,
    selectedSpeed,
    activeFilter,
  });

  // Gap 2: Hands-free voice control (with smile mode toggle)
  const handsFree = useHandsFree({
    onRecord: recording.handleRecordButton,
    onStop: () => {
      if (recording.recordingState === 'recording') recording.handleRecordButton();
    },
    onPhoto: photo.handleShutter,
    onFlip: () => { stream.flipCamera(); zoom.resetZoom(); },
    isRecording: recording.recordingState === 'recording',
    cameraMode,
  });

  // Gap 2: Smile detection (wired to hands-free smile mode)
  useSmileDetection({
    videoRef: stream.videoRef,
    enabled: handsFree.smileEnabled,
    onSmileStart: () => {
      if (recording.recordingState === 'idle' && cameraMode !== 'photo') {
        handsFree.setLastCommand('Smile detected - Recording');
        recording.handleRecordButton();
      }
    },
    onSmileEnd: () => {
      if (recording.recordingState === 'recording') {
        handsFree.setLastCommand('Smile ended - Stopping');
        recording.handleRecordButton();
      }
    },
  });

  // Stabilize refs
  const streamRef = useRef(stream);
  useEffect(() => { streamRef.current = stream; }, [stream]);
  const recordingRef = useRef(recording);
  useEffect(() => { recordingRef.current = recording; }, [recording]);
  const cameraKitRef = useRef(cameraKit);
  useEffect(() => { cameraKitRef.current = cameraKit; }, [cameraKit]);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/camera');
      return;
    }
    streamRef.current.initCamera();
    return () => {
      streamRef.current.cleanup();
      recordingRef.current.cleanupTimer();
      cameraKitRef.current.cleanup();
    };
  }, [isAuthenticated, isAuthVerified, router]);

  // Initialize Camera Kit after stream is ready
  const prevStreamRef = useRef<MediaStream | null>(null);
  useEffect(() => {
    const currentStream = stream.streamRef.current;
    if (currentStream && currentStream !== prevStreamRef.current) {
      prevStreamRef.current = currentStream;
      if (cameraKit.isLoaded) {
        cameraKit.updateSource(currentStream, stream.cameraFacing);
      } else if (!cameraKit.isLoading) {
        cameraKit.initCameraKit(currentStream, stream.cameraFacing);
      }
    }
  }, [stream.streamRef, stream.cameraFacing, cameraKit]);

  const handleLensSelect = useCallback((lensId: string | null) => {
    if (recording.recordingState === 'recording' || recording.recordingState === 'paused') return;
    if (lensId) {
      cameraKit.applyLens(lensId);
      setSelectedFilter(0);
      setSelectedEffect(0);
    } else {
      cameraKit.removeLens();
    }
  }, [recording.recordingState, cameraKit]);

  const closeAllPanels = useCallback(() => {
    setShowFilters(false);
    setShowEffects(false);
    setShowSpeed(false);
    setShowLenses(false);
    setShowDuration(false);
    setShowEffectCategories(false);
    setShowTemplates(false);
  }, []);

  const handleCameraModeChange = useCallback((mode: CameraMode) => {
    if (recording.recordingState === 'recording' || recording.recordingState === 'paused') return;
    setCameraMode(mode);
    if (mode === 'story') {
      setMaxDuration(challenge.isActive && challenge.maxDuration ? challenge.maxDuration : 15);
    } else if (mode === 'video') {
      setMaxDuration(challenge.isActive && challenge.maxDuration ? challenge.maxDuration : 180);
    }
    closeAllPanels();
  }, [recording.recordingState, challenge, closeAllPanels]);

  const togglePanel = useCallback((panel: PanelName) => {
    const set = (target: PanelName, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      setter(panel === target ? (prev) => !prev : false);
    };
    set('filters', setShowFilters);
    set('effects', setShowEffects);
    set('speed', setShowSpeed);
    set('lenses', setShowLenses);
    set('duration', setShowDuration);
    set('effectCategories', setShowEffectCategories);
    set('templates', setShowTemplates);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Gap 5/6/7: Smart navigation after recording
  const handleNext = useCallback(() => {
    const blob = recording.getRecordedBlob();
    if (!blob || !recording.previewUrl) return;

    sessionStorage.setItem('recordedVideoUrl', recording.previewUrl);

    // Gap 6: DM mode -- send to messages
    if (dm.isDMMode) {
      dm.sendAsDM(recording.previewUrl);
      return;
    }

    // Gap 7: Clip-only mode -- save and return to editor
    if (clipOnly.isClipOnly) {
      clipOnly.saveClipAndReturn(recording.previewUrl, blob);
      return;
    }

    // Gap 5: Challenge mode -- add challenge hashtag to upload URL
    if (cameraMode === 'story') {
      const url = challenge.isActive
        ? challenge.getUploadUrl('/upload?from=camera&story=true')
        : '/upload?from=camera&story=true';
      router.push(url);
    } else {
      const url = challenge.isActive
        ? challenge.getUploadUrl('/upload?from=camera')
        : '/upload?from=camera';
      router.push(url);
    }
  }, [recording, router, cameraMode, dm, clipOnly, challenge]);

  // Reset zoom on camera flip
  const flipCamera = useCallback(() => {
    stream.flipCamera();
    zoom.resetZoom();
  }, [stream, zoom]);

  return {
    isAuthenticated,
    isAuthVerified,
    cameraMode,
    handleCameraModeChange,
    // Recording state
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
    setMaxDuration,
    flashOn: stream.flashOn,
    torchSupported: stream.torchSupported,
    toggleFlash: stream.toggleFlash,
    timerMode: recording.timerMode,
    countdown: recording.countdown,
    showFilters,
    showEffects,
    showSpeed,
    showLenses,
    showDuration,
    showEffectCategories,
    showTemplates,
    showPhotoPreview,
    setShowPhotoPreview,
    previewUrl: recording.previewUrl,
    error: stream.error,
    videoRef: stream.videoRef,
    previewVideoRef: recording.previewVideoRef,
    effectsCanvasRef: effects.effectsCanvasRef,
    flipCamera,
    handleRecordButton: recording.handleRecordButton,
    pauseRecording: recording.pauseRecording,
    discardRecording: recording.discardRecording,
    handleNext,
    formatTime,
    togglePanel,
    cycleTimer: recording.cycleTimer,
    goBack: () => router.back(),
    goToUpload: () => router.push('/upload'),
    // Multi-clip
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
    // Camera Kit (Gap 1)
    cameraKitCanvasRef: cameraKit.canvasRef,
    isCameraKitActive: cameraKit.isCameraKitActive,
    cameraKitLenses: cameraKit.lenses,
    activeLensId: cameraKit.activeLensId,
    cameraKitLoading: cameraKit.isLoading,
    cameraKitError: cameraKit.error,
    cameraKitLoaded: cameraKit.isLoaded,
    handleLensSelect,
    // Photo
    photo,
    // Zoom
    zoom,
    // Hands-free (Gap 2: now includes smile mode)
    handsFree,
    // Gap 4: Template recording
    template,
    // Gap 5: Challenge camera
    challenge,
    // Gap 6: DM recording
    dm,
    // Gap 7: Clip-only mode
    clipOnly,
  };
}

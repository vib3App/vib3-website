'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

type RecordingState = 'idle' | 'recording' | 'paused' | 'preview';
type CameraFacing = 'user' | 'environment';

export const CAMERA_FILTERS = [
  { name: 'Normal', filter: 'none' },
  { name: 'Vintage', filter: 'sepia(0.5) contrast(1.1)' },
  { name: 'B&W', filter: 'grayscale(1)' },
  { name: 'Warm', filter: 'sepia(0.3) saturate(1.4)' },
  { name: 'Cool', filter: 'hue-rotate(180deg) saturate(0.7)' },
  { name: 'Vivid', filter: 'saturate(1.5) contrast(1.1)' },
  { name: 'Fade', filter: 'contrast(0.9) brightness(1.1) saturate(0.8)' },
  { name: 'Drama', filter: 'contrast(1.3) brightness(0.9)' },
];

export const CAMERA_EFFECTS = [
  { name: 'None', icon: '✨' },
  { name: 'Sparkle', icon: '⭐' },
  { name: 'Hearts', icon: '💕' },
  { name: 'Confetti', icon: '🎉' },
  { name: 'Snow', icon: '❄️' },
  { name: 'Fire', icon: '🔥' },
];

export const CAMERA_SPEEDS = [
  { label: '0.3x', value: 0.3 },
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '3x', value: 3 },
];

export function useCamera() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>('user');
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [selectedEffect, setSelectedEffect] = useState(0);
  const [selectedSpeed, setSelectedSpeed] = useState(2);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [maxDuration] = useState(180);
  const [flashOn, setFlashOn] = useState(false);
  const [timerMode, setTimerMode] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      setError(null);
    } catch (err) {
      console.error('Failed to access camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, [cameraFacing]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/camera');
      return;
    }
    initCamera();
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isAuthenticated, router, initCamera]);

  const flipCamera = useCallback(() => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=vp9,opus' });
    } catch {
      recorder = new MediaRecorder(streamRef.current);
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setRecordingState('preview');
    };

    recorder.start(100);
    mediaRecorderRef.current = recorder;
    setRecordingState('recording');
    setRecordingDuration(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= maxDuration) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
  }, [maxDuration, stopRecording]);

  const handleRecordButton = useCallback(() => {
    if (recordingState === 'idle') {
      if (timerMode > 0) {
        setCountdown(timerMode);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(timer);
              setCountdown(null);
              startRecording();
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        startRecording();
      }
    } else if (recordingState === 'recording') {
      stopRecording();
    } else if (recordingState === 'paused') {
      resumeRecording();
    }
  }, [recordingState, timerMode, startRecording, stopRecording, resumeRecording]);

  const discardRecording = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setRecordedBlob(null);
    setPreviewUrl(null);
    setRecordingState('idle');
    setRecordingDuration(0);
  }, [previewUrl]);

  const handleNext = useCallback(() => {
    if (recordedBlob) {
      sessionStorage.setItem('recordedVideoUrl', previewUrl || '');
      router.push('/upload?from=camera');
    }
  }, [recordedBlob, previewUrl, router]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const togglePanel = useCallback((panel: 'filters' | 'effects' | 'speed') => {
    setShowFilters(panel === 'filters' ? !showFilters : false);
    setShowEffects(panel === 'effects' ? !showEffects : false);
    setShowSpeed(panel === 'speed' ? !showSpeed : false);
  }, [showFilters, showEffects, showSpeed]);

  const cycleTimer = useCallback(() => {
    setTimerMode(prev => prev === 0 ? 3 : prev === 3 ? 10 : 0);
  }, []);

  return {
    isAuthenticated,
    recordingState,
    cameraFacing,
    selectedFilter,
    setSelectedFilter,
    selectedEffect,
    setSelectedEffect,
    selectedSpeed,
    setSelectedSpeed,
    recordingDuration,
    maxDuration,
    flashOn,
    setFlashOn,
    timerMode,
    countdown,
    showFilters,
    showEffects,
    showSpeed,
    previewUrl,
    error,
    videoRef,
    previewVideoRef,
    flipCamera,
    handleRecordButton,
    pauseRecording,
    discardRecording,
    handleNext,
    formatTime,
    togglePanel,
    cycleTimer,
    goBack: () => router.back(),
    goToUpload: () => router.push('/upload'),
  };
}

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { RecordingState } from './types';
import { preloadFFmpeg } from '@/utils/videoMerge';
import { useCanvasPipeline } from './useCanvasPipeline';
import { useClipManagement } from './useClipManagement';

export interface RecordedClip {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
}

interface RecordingConfig {
  streamRef: React.RefObject<MediaStream | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  effectsCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraKitCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraKitActive: boolean;
  maxDuration: number;
  selectedSpeed: number;
  activeFilter: string;
}

const MAX_CLIPS = 8;

export function useCameraRecording({
  streamRef, videoRef, effectsCanvasRef,
  cameraKitCanvasRef, isCameraKitActive,
  maxDuration, selectedSpeed, activeFilter,
}: RecordingConfig) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timerMode, setTimerMode] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clipStartTimeRef = useRef<number>(0);
  const ckActiveAtStartRef = useRef(false);

  const pipeline = useCanvasPipeline();
  const clips = useClipManagement(selectedSpeed);

  const remainingDuration = maxDuration - clips.totalClipsDuration;

  useEffect(() => { preloadFFmpeg(); }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    pipeline.stopCanvasPipeline();
  }, [pipeline]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    if (clips.recordedClips.length >= MAX_CLIPS) return;

    chunksRef.current = [];
    clipStartTimeRef.current = Date.now();
    ckActiveAtStartRef.current = isCameraKitActive;

    let recordStream: MediaStream;

    if (isCameraKitActive && cameraKitCanvasRef.current) {
      // Camera Kit path: capture from CK canvas
      const ckStream = cameraKitCanvasRef.current.captureStream(30);
      const audioTracks = streamRef.current.getAudioTracks();
      recordStream = new MediaStream([
        ...ckStream.getVideoTracks(),
        ...audioTracks,
      ]);
    } else {
      const hasFilter = activeFilter && activeFilter !== 'none';
      const hasEffects = effectsCanvasRef.current !== null;
      const useCanvasCapture = (hasFilter || hasEffects) && videoRef.current;

      if (useCanvasCapture) {
        const canvas = pipeline.startCanvasPipeline(
          videoRef.current!, activeFilter, effectsCanvasRef,
        );
        const canvasStream = canvas.captureStream(30);
        const audioTracks = streamRef.current.getAudioTracks();
        recordStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...audioTracks,
        ]);
      } else {
        recordStream = streamRef.current;
      }
    }

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(recordStream, { mimeType: 'video/webm;codecs=vp9,opus' });
    } catch {
      recorder = new MediaRecorder(recordStream);
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      if (!ckActiveAtStartRef.current) {
        pipeline.stopCanvasPipeline();
      }
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const clipDuration = Math.round((Date.now() - clipStartTimeRef.current) / 1000);
      const url = URL.createObjectURL(blob);
      clips.addClip({ id: `clip-${Date.now()}`, blob, url, duration: clipDuration });
      setRecordingState('idle');
      setRecordingDuration(0);
    };

    recorder.start(100);
    mediaRecorderRef.current = recorder;
    setRecordingState('recording');
    setRecordingDuration(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => {
        const newDuration = prev + 1;
        if (newDuration >= remainingDuration) {
          stopRecording();
          return prev;
        }
        return newDuration;
      });
    }, 1000);
  }, [streamRef, videoRef, effectsCanvasRef, cameraKitCanvasRef, isCameraKitActive, activeFilter, stopRecording, pipeline, clips, remainingDuration]);

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
          const newDuration = prev + 1;
          if (newDuration >= remainingDuration) {
            stopRecording();
            return prev;
          }
          return newDuration;
        });
      }, 1000);
    }
  }, [remainingDuration, stopRecording]);

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

  const discardAllClips = useCallback(() => {
    clips.discardAllClips();
    setRecordingState('idle');
    setRecordingDuration(0);
  }, [clips]);

  const goToPreview = useCallback(async () => {
    if (clips.recordedClips.length === 0) return;
    await clips.combineClips();
    setRecordingState('preview');
  }, [clips]);

  const discardRecording = useCallback(() => {
    clips.discardPreview();
    setRecordingState('idle');
  }, [clips]);

  const cycleTimer = useCallback(() => {
    setTimerMode(prev => prev === 0 ? 3 : prev === 3 ? 10 : 0);
  }, []);

  const cleanupTimer = useCallback(() => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  }, []);

  return {
    recordingState,
    recordingDuration,
    recordedClips: clips.recordedClips,
    clipCount: clips.recordedClips.length,
    totalClipsDuration: clips.totalClipsDuration,
    remainingDuration,
    maxClips: MAX_CLIPS,
    canAddMoreClips: clips.recordedClips.length < MAX_CLIPS && remainingDuration > 0,
    previewUrl: clips.previewUrl,
    timerMode,
    countdown,
    isCombining: clips.isCombining,
    mergeProgress: clips.mergeProgress,
    previewVideoRef,
    handleRecordButton,
    pauseRecording,
    removeLastClip: clips.removeLastClip,
    discardAllClips,
    discardRecording,
    goToPreview,
    getRecordedBlob: clips.getRecordedBlob,
    cycleTimer,
    cleanupTimer,
  };
}

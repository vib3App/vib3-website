'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { CAMERA_SPEEDS, type RecordingState } from './types';
import { mergeVideoClips, applyVideoSpeed, preloadFFmpeg } from '@/utils/videoMerge';

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
  maxDuration: number;
  selectedSpeed: number;
  activeFilter: string; // CSS filter string e.g. 'sepia(0.5)' or 'none'
}

const MAX_CLIPS = 8;

export function useCameraRecording({ streamRef, videoRef, effectsCanvasRef, maxDuration, selectedSpeed, activeFilter }: RecordingConfig) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedClips, setRecordedClips] = useState<RecordedClip[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [timerMode, setTimerMode] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCombining, setIsCombining] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clipStartTimeRef = useRef<number>(0);

  // Canvas pipeline refs for filter recording
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopCanvasPipeline = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    canvasRef.current = null;
  }, []);

  // Preload FFmpeg in background when component mounts
  useEffect(() => {
    preloadFFmpeg();
  }, []);

  // Calculate total duration of all clips
  const totalClipsDuration = recordedClips.reduce((acc, clip) => acc + clip.duration, 0);
  const remainingDuration = maxDuration - totalClipsDuration;

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    stopCanvasPipeline();
  }, [stopCanvasPipeline]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    if (recordedClips.length >= MAX_CLIPS) return;

    chunksRef.current = [];
    clipStartTimeRef.current = Date.now();

    // Use canvas pipeline when filter or particle effects are active
    const hasFilter = activeFilter && activeFilter !== 'none';
    const hasEffects = effectsCanvasRef.current !== null;
    const useCanvasPipeline = (hasFilter || hasEffects) && videoRef.current;
    let recordStream: MediaStream;

    if (useCanvasPipeline) {
      const video = videoRef.current!;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1920;
      canvasRef.current = canvas;

      const ctx = canvas.getContext('2d')!;

      // Start requestAnimationFrame drawing loop
      const draw = () => {
        if (!canvasRef.current) return; // pipeline was stopped

        // Draw filtered video frame
        if (hasFilter) {
          ctx.save();
          ctx.filter = activeFilter;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        // Composite particle effects overlay on top
        const effCanvas = effectsCanvasRef.current;
        if (effCanvas && effCanvas.width > 0 && effCanvas.height > 0) {
          ctx.drawImage(effCanvas, 0, 0, canvas.width, canvas.height);
        }

        animFrameRef.current = requestAnimationFrame(draw);
      };
      draw();

      // Get filtered video stream from canvas at 30fps
      const canvasStream = canvas.captureStream(30);

      // Combine canvas video track with original audio tracks
      const audioTracks = streamRef.current.getAudioTracks();
      recordStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioTracks,
      ]);
    } else {
      recordStream = streamRef.current;
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
      stopCanvasPipeline();
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const clipDuration = Math.round((Date.now() - clipStartTimeRef.current) / 1000);
      const url = URL.createObjectURL(blob);

      const newClip: RecordedClip = {
        id: `clip-${Date.now()}`,
        blob,
        url,
        duration: clipDuration,
      };

      setRecordedClips(prev => [...prev, newClip]);
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
        // Stop if we exceed remaining duration
        if (newDuration >= remainingDuration) {
          stopRecording();
          return prev;
        }
        return newDuration;
      });
    }, 1000);
  }, [streamRef, videoRef, effectsCanvasRef, activeFilter, stopRecording, stopCanvasPipeline, remainingDuration, recordedClips.length]);

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

  const removeLastClip = useCallback(() => {
    setRecordedClips(prev => {
      if (prev.length === 0) return prev;
      const lastClip = prev[prev.length - 1];
      URL.revokeObjectURL(lastClip.url);
      return prev.slice(0, -1);
    });
  }, []);

  const discardAllClips = useCallback(() => {
    recordedClips.forEach(clip => URL.revokeObjectURL(clip.url));
    setRecordedClips([]);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRecordingState('idle');
    setRecordingDuration(0);
  }, [recordedClips, previewUrl]);

  // Combine all clips into a single blob for upload using FFmpeg
  const combineClips = useCallback(async (): Promise<Blob | null> => {
    if (recordedClips.length === 0) return null;

    setIsCombining(true);
    setMergeProgress(0);

    try {
      let resultBlob: Blob;

      if (recordedClips.length === 1) {
        resultBlob = recordedClips[0].blob;
      } else {
        const allBlobs = recordedClips.map(clip => clip.blob);
        resultBlob = await mergeVideoClips(allBlobs, (progress) => {
          setMergeProgress(progress.percent * 0.6);
        });
      }

      // Apply speed adjustment if needed
      const speed = CAMERA_SPEEDS[selectedSpeed]?.value || 1;
      if (speed !== 1) {
        resultBlob = await applyVideoSpeed(resultBlob, speed, (progress) => {
          setMergeProgress(60 + progress.percent * 0.4);
        });
      }

      const url = URL.createObjectURL(resultBlob);
      setPreviewUrl(url);
      setRecordingState('preview');
      return resultBlob;
    } catch (error) {
      console.error('Failed to process clips:', error);
      const url = URL.createObjectURL(recordedClips[0].blob);
      setPreviewUrl(url);
      setRecordingState('preview');
      return recordedClips[0].blob;
    } finally {
      setIsCombining(false);
      setMergeProgress(0);
    }
  }, [recordedClips, selectedSpeed]);

  const goToPreview = useCallback(async () => {
    if (recordedClips.length === 0) return;
    await combineClips();
  }, [recordedClips.length, combineClips]);

  const discardRecording = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    // Go back to clip recording mode, keep existing clips
    setRecordingState('idle');
  }, [previewUrl]);

  const cycleTimer = useCallback(() => {
    setTimerMode(prev => prev === 0 ? 3 : prev === 3 ? 10 : 0);
  }, []);

  const cleanupTimer = useCallback(() => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  }, []);

  // Get combined blob for upload (from preview state)
  const getRecordedBlob = useCallback((): Blob | null => {
    if (recordedClips.length === 0) return null;
    if (recordedClips.length === 1) return recordedClips[0].blob;
    // Return combined blob
    const allBlobs = recordedClips.map(clip => clip.blob);
    return new Blob(allBlobs, { type: 'video/webm' });
  }, [recordedClips]);

  return {
    recordingState,
    recordingDuration,
    recordedClips,
    clipCount: recordedClips.length,
    totalClipsDuration,
    remainingDuration,
    maxClips: MAX_CLIPS,
    canAddMoreClips: recordedClips.length < MAX_CLIPS && remainingDuration > 0,
    previewUrl,
    timerMode,
    countdown,
    isCombining,
    mergeProgress,
    previewVideoRef,
    handleRecordButton,
    pauseRecording,
    removeLastClip,
    discardAllClips,
    discardRecording,
    goToPreview,
    getRecordedBlob,
    cycleTimer,
    cleanupTimer,
  };
}

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { logger } from '@/utils/logger';

interface UseRemixRecordingOptions {
  /** URL of the original video to play alongside recording */
  originalVideoUrl: string;
  /** ID of the original video for the backend */
  originalVideoId: string;
}

interface UseRemixRecordingReturn {
  /** Ref for the original video element */
  originalVideoRef: React.RefObject<HTMLVideoElement | null>;
  /** Ref for the camera preview element */
  cameraVideoRef: React.RefObject<HTMLVideoElement | null>;
  /** Whether camera is active */
  cameraActive: boolean;
  /** Whether currently recording */
  isRecording: boolean;
  /** Whether playing back recorded content */
  isPlaying: boolean;
  /** Recorded blob (null if not yet recorded) */
  recordedBlob: Blob | null;
  /** Object URL for recorded video preview */
  recordedUrl: string | null;
  /** Recording duration in seconds */
  recordingDuration: number;
  /** Clip start time in the original video */
  clipStartTime: number;
  /** Clip end time in the original video */
  clipEndTime: number;
  /** Error message if any */
  error: string | null;
  /** Start camera and microphone */
  startCamera: () => Promise<void>;
  /** Stop camera stream */
  stopCamera: () => void;
  /** Start synchronized recording */
  startRecording: () => void;
  /** Stop recording */
  stopRecording: () => void;
  /** Retry recording (discard current) */
  retryRecording: () => void;
  /** Toggle playback of recorded + original */
  togglePlayback: () => void;
  /** Set clip start time */
  setClipStartTime: (time: number) => void;
  /** Set clip end time */
  setClipEndTime: (time: number) => void;
}

/**
 * useRemixRecording - Manages synchronized playback of original video
 * and camera recording for duet/stitch remix. Handles camera access,
 * MediaRecorder, and cleanup.
 */
export function useRemixRecording({
  originalVideoUrl,
  originalVideoId,
}: UseRemixRecordingOptions): UseRemixRecordingReturn {
  const originalVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordStartTimeRef = useRef(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [clipStartTime, setClipStartTime] = useState(0);
  const [clipEndTime, setClipEndTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 720, height: 1280 },
        audio: true,
      });
      streamRef.current = stream;
      setCameraActive(true);

      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      logger.error('Camera access failed:', err);
      setError('Camera or microphone access denied. Please allow access and try again.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  }, []);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    const originalVideo = originalVideoRef.current;
    if (!stream || !originalVideo) return;

    chunksRef.current = [];
    setError(null);

    // Determine MIME type
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setRecordingDuration(
        (Date.now() - recordStartTimeRef.current) / 1000
      );
    };

    // Synchronize: reset original video and play together
    recordStartTimeRef.current = Date.now();
    setClipStartTime(originalVideo.currentTime);
    originalVideo.play().catch(() => {});
    recorder.start(100); // collect data every 100ms
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setIsPlaying(true);
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    const originalVideo = originalVideoRef.current;

    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    if (originalVideo) {
      setClipEndTime(originalVideo.currentTime);
      originalVideo.pause();
    }
    setIsRecording(false);
    setIsPlaying(false);
  }, []);

  const retryRecording = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingDuration(0);
    setClipStartTime(0);
    setClipEndTime(0);

    if (originalVideoRef.current) {
      originalVideoRef.current.currentTime = 0;
    }
  }, [recordedUrl]);

  const togglePlayback = useCallback(() => {
    const originalVideo = originalVideoRef.current;
    if (!originalVideo) return;

    if (isPlaying) {
      originalVideo.pause();
    } else {
      originalVideo.currentTime = clipStartTime;
      originalVideo.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, clipStartTime]);

  return {
    originalVideoRef,
    cameraVideoRef,
    cameraActive,
    isRecording,
    isPlaying,
    recordedBlob,
    recordedUrl,
    recordingDuration,
    clipStartTime,
    clipEndTime,
    error,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    retryRecording,
    togglePlayback,
    setClipStartTime,
    setClipEndTime,
  };
}

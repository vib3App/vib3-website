'use client';

import { useState, useRef, useCallback } from 'react';
import { CAMERA_SPEEDS, type RecordingState } from './types';

interface RecordingConfig {
  streamRef: React.RefObject<MediaStream | null>;
  maxDuration: number;
  selectedSpeed: number;
}

export function useCameraRecording({ streamRef, maxDuration, selectedSpeed }: RecordingConfig) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [timerMode, setTimerMode] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
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
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setRecordingState('preview');
      const speed = CAMERA_SPEEDS[selectedSpeed]?.value || 1;
      if (speed !== 1) {
        sessionStorage.setItem('recordingSpeed', speed.toString());
      }
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
  }, [streamRef, maxDuration, selectedSpeed, stopRecording]);

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

  const cycleTimer = useCallback(() => {
    setTimerMode(prev => prev === 0 ? 3 : prev === 3 ? 10 : 0);
  }, []);

  const cleanupTimer = useCallback(() => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  }, []);

  return {
    recordingState,
    recordingDuration,
    recordedBlob,
    previewUrl,
    timerMode,
    countdown,
    previewVideoRef,
    handleRecordButton,
    pauseRecording,
    discardRecording,
    cycleTimer,
    cleanupTimer,
  };
}

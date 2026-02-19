'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type EchoLayout = 'side-by-side' | 'top-bottom' | 'picture-in-picture';

interface EchoRecorderState {
  isRecording: boolean;
  isPreviewing: boolean;
  duration: number;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  cameraReady: boolean;
}

export function useEchoRecorder(_originalVideoUrl: string) {
  const [state, setState] = useState<EchoRecorderState>({
    isRecording: false,
    isPreviewing: false,
    duration: 0,
    recordedBlob: null,
    recordedUrl: null,
    cameraReady: false,
  });
  const [layout, setLayout] = useState<EchoLayout>('side-by-side');

  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const originalVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
      setState(prev => ({ ...prev, cameraReady: true }));
    } catch {
      // Camera not available
    }
  }, []);

  const startRecording = useCallback(() => {
    const stream = cameraStreamRef.current;
    if (!stream) return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setState(prev => ({ ...prev, isRecording: false, isPreviewing: true, recordedBlob: blob, recordedUrl: url }));
    };

    recorder.start(100);
    startTimeRef.current = Date.now();
    setState(prev => ({ ...prev, isRecording: true, duration: 0 }));

    // Start original video
    originalVideoRef.current?.play();

    timerRef.current = setInterval(() => {
      setState(prev => ({ ...prev, duration: (Date.now() - startTimeRef.current) / 1000 }));
    }, 100);
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    originalVideoRef.current?.pause();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const retake = useCallback(() => {
    if (state.recordedUrl) URL.revokeObjectURL(state.recordedUrl);
    setState(prev => ({ ...prev, isPreviewing: false, recordedBlob: null, recordedUrl: null, duration: 0 }));
    if (originalVideoRef.current) originalVideoRef.current.currentTime = 0;
  }, [state.recordedUrl]);

  const cleanup = useCallback(() => {
    cameraStreamRef.current?.getTracks().forEach(t => t.stop());
    if (state.recordedUrl) URL.revokeObjectURL(state.recordedUrl);
  }, [state.recordedUrl]);

  useEffect(() => {
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    layout,
    setLayout,
    cameraVideoRef,
    originalVideoRef,
    initCamera,
    startRecording,
    stopRecording,
    retake,
    cleanup,
  };
}

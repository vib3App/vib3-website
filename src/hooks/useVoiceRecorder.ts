'use client';

import { useState, useRef, useCallback } from 'react';

interface VoiceRecorderState {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setState(prev => ({ ...prev, isRecording: false, audioBlob: blob, audioUrl: url }));
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(100);
      startTimeRef.current = Date.now();
      setState(prev => ({ ...prev, isRecording: true, duration: 0, audioBlob: null, audioUrl: null }));

      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, duration: (Date.now() - startTimeRef.current) / 1000 }));
      }, 100);
    } catch {
      // Microphone not available
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cancelRecording = useCallback(() => {
    stopRecording();
    setState({ isRecording: false, duration: 0, audioBlob: null, audioUrl: null });
  }, [stopRecording]);

  const reset = useCallback(() => {
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    setState({ isRecording: false, duration: 0, audioBlob: null, audioUrl: null });
  }, [state.audioUrl]);

  return { ...state, startRecording, stopRecording, cancelRecording, reset };
}

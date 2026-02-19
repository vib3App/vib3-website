'use client';

import { useState, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface UseStreamRecordingOptions {
  onRecordingSaved?: (blob: Blob) => void;
}

export function useStreamRecording(options?: UseStreamRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getMimeType = useCallback(() => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || 'video/webm';
  }, []);

  const startRecording = useCallback((stream: MediaStream) => {
    if (isRecording || !stream) return;

    try {
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        options?.onRecordingSaved?.(blob);
        chunksRef.current = [];

        if (durationTimerRef.current) {
          clearInterval(durationTimerRef.current);
          durationTimerRef.current = null;
        }
      };

      recorder.onerror = (e) => {
        logger.error('MediaRecorder error:', e);
        setIsRecording(false);
      };

      recorder.start(1000); // Collect data every second
      recorderRef.current = recorder;
      setIsRecording(true);
      setDuration(0);

      durationTimerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      logger.info('Stream recording started');
    } catch (err) {
      logger.error('Failed to start recording:', err);
    }
  }, [isRecording, getMimeType, options]);

  const stopRecording = useCallback(() => {
    if (!recorderRef.current || recorderRef.current.state === 'inactive') return;

    recorderRef.current.stop();
    recorderRef.current = null;
    setIsRecording(false);
    logger.info('Stream recording stopped');
  }, []);

  const downloadRecording = useCallback((blob?: Blob) => {
    const target = blob || recordedBlob;
    if (!target) return;

    const url = URL.createObjectURL(target);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vib3-stream-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [recordedBlob]);

  const discardRecording = useCallback(() => {
    setRecordedBlob(null);
    chunksRef.current = [];
  }, []);

  const formatDuration = useCallback((secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRecording,
    duration,
    formattedDuration: formatDuration(duration),
    recordedBlob,
    startRecording,
    stopRecording,
    downloadRecording,
    discardRecording,
  };
}

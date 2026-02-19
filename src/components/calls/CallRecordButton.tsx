'use client';

import { useState, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';

/**
 * Gap #35: Call Recording
 *
 * Uses MediaRecorder API on combined local+remote streams.
 * Offers download when recording is stopped or call ends.
 */

interface CallRecordButtonProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  /** Called when recording blob is ready for download */
  onRecordingReady?: (blob: Blob) => void;
}

function getMimeType(): string {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || 'video/webm';
}

export function CallRecordButton({
  localStream,
  remoteStream,
  onRecordingReady,
}: CallRecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(() => {
    if (!localStream && !remoteStream) return;

    try {
      // Combine all tracks from both streams
      const combinedTracks: MediaStreamTrack[] = [];
      if (localStream) {
        localStream.getTracks().forEach((t) => combinedTracks.push(t));
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((t) => combinedTracks.push(t));
      }
      if (combinedTracks.length === 0) return;

      const combinedStream = new MediaStream(combinedTracks);
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(combinedStream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (onRecordingReady) {
          onRecordingReady(blob);
        } else {
          // Default: trigger download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `vib3-call-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        chunksRef.current = [];
      };

      recorder.start(1000);
      recorderRef.current = recorder;
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      logger.info('Call recording started');
    } catch (err) {
      logger.error('Failed to start call recording:', err);
    }
  }, [localStream, remoteStream, onRecordingReady]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    logger.info('Call recording stopped');
  }, []);

  const toggle = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <button
      onClick={toggle}
      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
        isRecording
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}
      title={isRecording ? `Recording ${formatDuration(duration)}` : 'Record Call'}
    >
      {isRecording ? (
        <div className="w-4 h-4 bg-white rounded-sm" />
      ) : (
        <div className="w-4 h-4 bg-red-500 rounded-full" />
      )}
      {isRecording && (
        <span className="absolute -bottom-5 text-[10px] text-red-400 whitespace-nowrap">
          {formatDuration(duration)}
        </span>
      )}
    </button>
  );
}

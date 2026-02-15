'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { logger } from '@/utils/logger';

// Pre-generate waveform heights for playback visualization
function generateWaveformHeights(count: number): number[] {
  return Array.from({ length: count }, () => Math.random() * 24 + 8);
}

interface VoiceRecorderProps {
  onComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
  maxDuration?: number;
}

export function VoiceRecorder({
  onComplete,
  onCancel,
  maxDuration = 60,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      setError(null);

      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      logger.error('Failed to start recording:', err);
      setError('Microphone access denied. Please allow microphone access to record voice comments.');
    }
  }, [maxDuration, stopRecording]);

  const handleSend = () => {
    if (audioBlob) {
      onComplete(audioBlob);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const waveformHeights = useMemo(() => generateWaveformHeights(40), []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t border-white/10 p-4 aurora-bg">
      {error ? (
        <div className="text-center">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={onCancel}
            className="text-white/70 hover:text-white text-sm"
          >
            Cancel
          </button>
        </div>
      ) : audioUrl ? (
        // Playback mode
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayback}
            className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-8 flex items-center gap-0.5">
              {waveformHeights.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-purple-500 rounded-full"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
            <span className="text-white/50 text-sm">{formatDuration(duration)}</span>
          </div>

          <button
            onClick={handleReset}
            className="text-white/50 hover:text-white p-2"
            title="Re-record"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={handleSend}
            className="bg-purple-500 text-white px-4 py-2 rounded-full font-medium hover:bg-purple-600"
          >
            Send
          </button>

          <button
            onClick={onCancel}
            className="text-white/50 hover:text-white p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
        </div>
      ) : (
        // Recording mode
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onCancel}
            className="text-white/50 hover:text-white"
          >
            Cancel
          </button>

          <div className="flex flex-col items-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {isRecording ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            <span className="text-white/70 text-sm mt-2">
              {isRecording ? formatDuration(duration) : 'Tap to record'}
            </span>
          </div>

          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      )}
    </div>
  );
}

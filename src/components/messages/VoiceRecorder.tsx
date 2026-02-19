'use client';

import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
}

export function VoiceRecorder({ onSend }: VoiceRecorderProps) {
  const { isRecording, duration, audioBlob, audioUrl, startRecording, stopRecording, cancelRecording, reset } = useVoiceRecorder();

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
      reset();
    }
  };

  if (audioBlob && audioUrl) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={reset} className="text-white/50 hover:text-white p-1" aria-label="Discard">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <div className="flex-1 glass rounded-full px-3 py-2 flex items-center gap-2">
          <audio src={audioUrl} controls className="h-8 w-full" style={{ maxHeight: '32px' }} />
        </div>
        <button onClick={handleSend} className="w-10 h-10 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center" aria-label="Send voice message">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-3">
        <button onClick={cancelRecording} className="text-red-400 hover:text-red-300 p-1" aria-label="Cancel">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-3 glass rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <WaveformBars />
          <span className="text-white/60 text-sm font-mono">{formatDuration(duration)}</span>
        </div>
        <button onClick={stopRecording} className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center" aria-label="Stop recording">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </button>
      </div>
    );
  }

  return (
    <button
      onPointerDown={startRecording}
      className="text-white/50 hover:text-white transition-colors"
      aria-label="Record voice message"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
}

// Pre-computed random values for deterministic rendering
const BAR_HEIGHTS = [72, 45, 88, 31, 95, 52, 68, 39, 81, 57, 43, 91, 64, 36, 78, 49, 85, 55, 70, 41];
const BAR_DURATIONS = [0.52, 0.41, 0.67, 0.35, 0.73, 0.48, 0.59, 0.38, 0.65, 0.44, 0.56, 0.71, 0.46, 0.33, 0.62, 0.5, 0.69, 0.42, 0.58, 0.37];
const WAVEFORM_TARGET = 18;

function WaveformBars() {
  return (
    <div className="flex items-center gap-0.5 h-6">
      {BAR_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="w-1 bg-red-400 rounded-full"
          style={{
            height: `${h}%`,
            minHeight: '4px',
            animation: `waveform ${BAR_DURATIONS[i]}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes waveform {
          from { height: 4px; }
          to { height: ${WAVEFORM_TARGET}px; }
        }
      `}</style>
    </div>
  );
}

'use client';

import {
  VideoCameraIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface RemixControlsProps {
  mediaStream: MediaStream | null;
  recordedBlob: Blob | null;
  isRecording: boolean;
  isPlaying: boolean;
  onStartCamera: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTogglePlayback: () => void;
  onRetry: () => void;
}

export function RemixControls({
  mediaStream,
  recordedBlob,
  isRecording,
  isPlaying,
  onStartCamera,
  onStartRecording,
  onStopRecording,
  onTogglePlayback,
  onRetry,
}: RemixControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      {!mediaStream && !recordedBlob && (
        <button
          onClick={onStartCamera}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
        >
          <VideoCameraIcon className="w-5 h-5" />
          Start Camera
        </button>
      )}

      {mediaStream && !recordedBlob && (
        <>
          {!isRecording ? (
            <button
              onClick={onStartRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full font-medium transition"
            >
              <PlayIcon className="w-5 h-5" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={onStopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium transition"
            >
              <PauseIcon className="w-5 h-5" />
              Stop
            </button>
          )}
        </>
      )}

      {recordedBlob && (
        <>
          <button
            onClick={onTogglePlayback}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
          >
            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
          </button>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Retry
          </button>
        </>
      )}
    </div>
  );
}

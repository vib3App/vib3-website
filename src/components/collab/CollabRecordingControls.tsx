'use client';

import { PlayIcon, StopIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface CollabRecordingControlsProps {
  isRecording: boolean;
  hasRecordedUrl: boolean;
  hasSubmitted: boolean;
  uploadProgress: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRetry: () => void;
  onSubmit: () => void;
}

export function CollabRecordingControls({
  isRecording,
  hasRecordedUrl,
  hasSubmitted,
  uploadProgress,
  onStartRecording,
  onStopRecording,
  onRetry,
  onSubmit,
}: CollabRecordingControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {!hasRecordedUrl ? (
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
              <StopIcon className="w-5 h-5" />
              Stop Recording
            </button>
          )}
        </>
      ) : (
        <>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Retry
          </button>

          {!hasSubmitted && (
            <button
              onClick={onSubmit}
              disabled={uploadProgress > 0}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-full font-medium transition"
            >
              {uploadProgress > 0 ? (
                `Uploading ${uploadProgress}%`
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Submit Clip
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}

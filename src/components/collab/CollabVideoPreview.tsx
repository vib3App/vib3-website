'use client';

import { VideoCameraIcon } from '@heroicons/react/24/outline';

interface CollabVideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  recordedUrl: string | null;
  hasMediaStream: boolean;
  isRecording: boolean;
  onStartPreview: () => void;
}

export function CollabVideoPreview({
  videoRef,
  recordedUrl,
  hasMediaStream,
  isRecording,
  onStartPreview,
}: CollabVideoPreviewProps) {
  return (
    <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative">
      {recordedUrl ? (
        <video src={recordedUrl} controls className="w-full h-full object-contain" />
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      )}

      {!hasMediaStream && !recordedUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <VideoCameraIcon className="w-16 h-16 text-gray-600 mb-4" />
          <button
            onClick={onStartPreview}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
          >
            Start Camera
          </button>
        </div>
      )}

      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full" />
          REC
        </div>
      )}
    </div>
  );
}

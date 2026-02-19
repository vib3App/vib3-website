'use client';

import { useRemixRecording } from '@/hooks/useRemixRecording';

interface RemixRecorderProps {
  originalVideoUrl: string;
  originalVideoId: string;
  /** Split position percentage (20-80) for duet layout */
  splitPosition?: number;
  /** Callback when recording is complete with the blob */
  onRecordingComplete?: (blob: Blob, clipStart: number, clipEnd: number) => void;
}

/**
 * RemixRecorder - Side-by-side split-screen view for duet/stitch recording.
 * Left: original video. Right: user's camera feed or recorded preview.
 */
export function RemixRecorder({
  originalVideoUrl,
  originalVideoId,
  splitPosition = 50,
  onRecordingComplete,
}: RemixRecorderProps) {
  const {
    originalVideoRef,
    cameraVideoRef,
    cameraActive,
    isRecording,
    isPlaying,
    recordedBlob,
    recordedUrl,
    error,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    retryRecording,
    togglePlayback,
    clipStartTime,
    clipEndTime,
  } = useRemixRecording({ originalVideoUrl, originalVideoId });

  const handleComplete = () => {
    if (recordedBlob && onRecordingComplete) {
      onRecordingComplete(recordedBlob, clipStartTime, clipEndTime);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Error display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Split screen preview */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900">
        <div className="absolute inset-0 flex">
          {/* Left side - Original video */}
          <div
            className="relative h-full"
            style={{ width: `${splitPosition}%` }}
          >
            <video
              ref={originalVideoRef}
              src={originalVideoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              loop={!isRecording}
            />
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded-lg text-white text-xs">
              Original
            </div>
          </div>

          {/* Divider */}
          <div className="w-0.5 bg-white/20 z-10" />

          {/* Right side - Camera / Recording */}
          <div
            className="relative h-full bg-gray-800"
            style={{ width: `${100 - splitPosition}%` }}
          >
            {recordedUrl ? (
              <video
                src={recordedUrl}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                loop
              />
            ) : (
              <>
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CameraPlaceholder />
                  </div>
                )}
              </>
            )}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded-lg text-white text-xs">
              You
            </div>
          </div>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full z-20">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">REC</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!cameraActive && !recordedBlob && (
          <RecorderButton
            label="Start Camera"
            icon={<CameraIcon />}
            variant="primary"
            onClick={startCamera}
          />
        )}

        {cameraActive && !recordedBlob && (
          <>
            {!isRecording ? (
              <RecorderButton
                label="Start Recording"
                icon={<RecordIcon />}
                variant="danger"
                onClick={startRecording}
              />
            ) : (
              <RecorderButton
                label="Stop"
                icon={<StopIcon />}
                variant="default"
                onClick={stopRecording}
              />
            )}
          </>
        )}

        {recordedBlob && (
          <>
            <RecorderButton
              label={isPlaying ? 'Pause' : 'Preview'}
              icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
              variant="default"
              onClick={togglePlayback}
            />
            <RecorderButton
              label="Retry"
              icon={<RetryIcon />}
              variant="default"
              onClick={retryRecording}
            />
            <RecorderButton
              label="Use This"
              icon={<CheckIcon />}
              variant="primary"
              onClick={handleComplete}
            />
          </>
        )}
      </div>
    </div>
  );
}

function RecorderButton({
  label,
  icon,
  variant,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  variant: 'primary' | 'danger' | 'default';
  onClick: () => void;
}) {
  const baseClass = 'flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all';
  const variantClass =
    variant === 'primary'
      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90'
      : variant === 'danger'
      ? 'bg-red-500 text-white hover:bg-red-600'
      : 'bg-white/10 text-white hover:bg-white/20';

  return (
    <button onClick={onClick} className={`${baseClass} ${variantClass}`}>
      {icon}
      {label}
    </button>
  );
}

function CameraPlaceholder() {
  return (
    <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function RecordIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

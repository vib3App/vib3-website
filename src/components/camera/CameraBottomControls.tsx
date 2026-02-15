'use client';

interface CameraBottomControlsProps {
  recordingState: 'idle' | 'recording' | 'paused' | 'preview';
  clipCount: number;
  canAddMoreClips: boolean;
  isCombining: boolean;
  mergeProgress: number;
  onRecord: () => void;
  onPause: () => void;
  onRemoveLastClip: () => void;
  onDiscardAll: () => void;
  onDiscard: () => void;
  onGoToPreview: () => void;
  onNext: () => void;
  onGoToUpload: () => void;
}

export function CameraBottomControls({
  recordingState,
  clipCount,
  canAddMoreClips,
  isCombining,
  mergeProgress,
  onRecord,
  onPause,
  onRemoveLastClip,
  onDiscardAll,
  onDiscard,
  onGoToPreview,
  onNext,
  onGoToUpload,
}: CameraBottomControlsProps) {
  // Preview mode - show discard and next buttons
  if (recordingState === 'preview') {
    return (
      <div className="absolute bottom-8 left-0 right-0 z-10 px-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onDiscard}
            className="w-14 h-14 rounded-full bg-black/30 flex items-center justify-center"
            title="Back to recording"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white font-semibold rounded-full"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Combining clips loading state
  if (isCombining) {
    return (
      <div className="absolute bottom-8 left-0 right-0 z-10 px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-48 h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all duration-300"
              style={{ width: `${mergeProgress}%` }}
            />
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-black/50 rounded-full">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-white font-medium">
              {mergeProgress < 50 ? 'Loading editor...' : 'Merging clips...'} {mergeProgress}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-8 left-0 right-0 z-10 px-4">
      {/* Clip count indicator */}
      {clipCount > 0 && recordingState !== 'recording' && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full">
            <div className="flex gap-1">
              {Array.from({ length: clipCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-teal-400"
                />
              ))}
            </div>
            <span className="text-white text-sm font-medium">
              {clipCount} clip{clipCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-6">
        {/* Left button: Upload from gallery OR Remove last clip */}
        {clipCount > 0 && recordingState !== 'recording' ? (
          <button
            onClick={onRemoveLastClip}
            className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center"
            title="Remove last clip"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onGoToUpload}
            className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center"
            title="Upload from gallery"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}

        {/* Record button */}
        <button
          onClick={canAddMoreClips || recordingState === 'recording' ? onRecord : undefined}
          disabled={!canAddMoreClips && recordingState !== 'recording'}
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
            recordingState === 'recording'
              ? 'border-red-500 bg-transparent'
              : canAddMoreClips
                ? 'border-white bg-transparent'
                : 'border-gray-500 bg-transparent opacity-50'
          }`}
        >
          {recordingState === 'recording' ? (
            <div className="w-8 h-8 bg-red-500 rounded-md" />
          ) : recordingState === 'paused' ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <div className={`w-16 h-16 rounded-full ${canAddMoreClips ? 'bg-red-500' : 'bg-gray-500'}`} />
          )}
        </button>

        {/* Right button: Pause (when recording) OR Done/Next (when clips exist) */}
        {recordingState === 'recording' ? (
          <button
            onClick={onPause}
            className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center"
            title="Pause recording"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        ) : clipCount > 0 ? (
          <button
            onClick={onGoToPreview}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 flex items-center justify-center"
            title="Done - preview video"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        ) : (
          <div className="w-12 h-12" />
        )}
      </div>

      {/* Discard all button (when clips exist and not recording) */}
      {clipCount > 0 && recordingState === 'idle' && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onDiscardAll}
            className="px-4 py-2 text-white/60 text-sm hover:text-white transition-colors"
          >
            Discard all
          </button>
        </div>
      )}
    </div>
  );
}

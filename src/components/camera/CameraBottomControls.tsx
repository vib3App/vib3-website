'use client';

interface CameraBottomControlsProps {
  recordingState: 'idle' | 'recording' | 'paused' | 'preview';
  onRecord: () => void;
  onPause: () => void;
  onDiscard: () => void;
  onNext: () => void;
  onGoToUpload: () => void;
}

export function CameraBottomControls({
  recordingState,
  onRecord,
  onPause,
  onDiscard,
  onNext,
  onGoToUpload,
}: CameraBottomControlsProps) {
  if (recordingState === 'preview') {
    return (
      <div className="absolute bottom-8 left-0 right-0 z-10 px-4">
        <div className="flex items-center justify-between">
          <button onClick={onDiscard} className="w-14 h-14 rounded-full bg-black/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button onClick={onNext} className="px-8 py-3 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full">
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-8 left-0 right-0 z-10 px-4">
      <div className="flex items-center justify-center gap-8">
        <button onClick={onGoToUpload} className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          onClick={onRecord}
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
            recordingState === 'recording' ? 'border-red-500 bg-transparent' : 'border-white bg-transparent'
          }`}
        >
          {recordingState === 'recording' ? (
            <div className="w-8 h-8 bg-red-500 rounded-md" />
          ) : recordingState === 'paused' ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <div className="w-16 h-16 bg-red-500 rounded-full" />
          )}
        </button>

        {recordingState === 'recording' ? (
          <button onClick={onPause} className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        ) : (
          <div className="w-12 h-12" />
        )}
      </div>
    </div>
  );
}

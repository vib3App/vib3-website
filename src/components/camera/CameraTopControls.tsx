'use client';

interface CameraTopControlsProps {
  flashOn: boolean;
  torchSupported?: boolean;
  timerMode: 0 | 3 | 10;
  recordingState: 'idle' | 'recording' | 'paused' | 'preview';
  recordingDuration: number;
  maxDuration: number;
  onClose: () => void;
  onFlashToggle: () => void;
  onTimerCycle: () => void;
  onFlipCamera: () => void;
  formatTime: (seconds: number) => string;
}

export function CameraTopControls({
  flashOn,
  torchSupported = false,
  timerMode,
  recordingState,
  recordingDuration,
  maxDuration,
  onClose,
  onFlashToggle,
  onTimerCycle,
  onFlipCamera,
  formatTime,
}: CameraTopControlsProps) {
  return (
    <div className="absolute top-4 left-0 right-0 z-10 px-4">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center" aria-label="Close camera">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onFlashToggle}
            disabled={!torchSupported}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              !torchSupported
                ? 'bg-black/20 opacity-50 cursor-not-allowed'
                : flashOn
                  ? 'bg-yellow-500'
                  : 'bg-black/30'
            }`}
            title={torchSupported ? (flashOn ? 'Turn off flash' : 'Turn on flash') : 'Flash not available on this device'}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 2v11h3v9l7-12h-4l4-8z" />
            </svg>
          </button>

          <button
            onClick={onTimerCycle}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${timerMode > 0 ? 'bg-purple-500' : 'bg-black/30'}`}
          >
            <span className="text-white text-xs font-medium">{timerMode > 0 ? `${timerMode}s` : 'Off'}</span>
          </button>

          <button onClick={onFlipCamera} className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center" aria-label="Flip camera">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {(recordingState === 'recording' || recordingState === 'paused') && (
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
            <div className={`w-3 h-3 rounded-full ${recordingState === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-white font-mono">{formatTime(recordingDuration)}</span>
            <span className="text-white/50 text-sm">/ {formatTime(maxDuration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

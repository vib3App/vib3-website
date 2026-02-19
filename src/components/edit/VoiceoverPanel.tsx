'use client';

interface VoiceoverPanelProps {
  isRecording: boolean;
  duration: number;
  amplitude: number;
  hasVoiceover: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDiscard: () => void;
  formatTime: (s: number) => string;
}

export function VoiceoverPanel({
  isRecording, duration, amplitude, hasVoiceover,
  onStartRecording, onStopRecording, onDiscard, formatTime,
}: VoiceoverPanelProps) {
  return (
    <div className="space-y-4">
      <p className="text-white/60 text-sm">
        Record narration over your video. Original audio will be preserved.
      </p>

      {/* Amplitude visualization */}
      <div className="flex items-center justify-center gap-1 h-12">
        {Array.from({ length: 20 }).map((_, i) => {
          // Deterministic wave pattern based on bar index + amplitude
          const wave = Math.sin((i / 20) * Math.PI * 3) * 0.5 + 0.5;
          const barHeight = isRecording ? wave * amplitude * 48 : 0;
          return (
            <div
              key={i}
              className="w-1.5 rounded-full bg-purple-500 transition-all duration-75"
              style={{ height: `${Math.max(4, barHeight)}px` }}
            />
          );
        })}
      </div>

      {isRecording && (
        <div className="text-center">
          <span className="text-white font-mono text-lg">{formatTime(duration)}</span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-sm">Recording</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!isRecording ? (
          <button
            onClick={onStartRecording}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={onStopRecording}
            className="flex-1 py-3 rounded-xl bg-white/20 text-white font-medium hover:bg-white/30 transition-colors"
          >
            Stop Recording
          </button>
        )}

        {hasVoiceover && !isRecording && (
          <button
            onClick={onDiscard}
            className="py-3 px-4 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-sm"
          >
            Discard
          </button>
        )}
      </div>

      {hasVoiceover && !isRecording && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-400 text-sm">Voiceover recorded</span>
        </div>
      )}
    </div>
  );
}

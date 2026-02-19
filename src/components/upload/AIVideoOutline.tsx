'use client';

interface OutlineScene {
  timestamp: number;
  description: string;
  suggestion: string;
}

interface VideoOutline {
  scenes: OutlineScene[];
}

interface AIVideoOutlineProps {
  videoUrl: string | null;
  outline: VideoOutline | null;
  isGenerating: boolean;
  onGenerate: () => void;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AIVideoOutline({ videoUrl, outline, isGenerating, onGenerate }: AIVideoOutlineProps) {
  if (!videoUrl) return null;

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-white font-medium text-sm">AI Video Outline</h3>
        </div>
        {!isGenerating && !outline && (
          <button
            onClick={onGenerate}
            className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full hover:opacity-90 transition"
          >
            Generate Outline
          </button>
        )}
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-purple-500 animate-spin" />
          <p className="text-white/50 text-sm">Analyzing your video...</p>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-teal-400 animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Outline results */}
      {outline && !isGenerating && (
        <div className="space-y-3">
          <p className="text-white/40 text-xs">
            {outline.scenes.length} scenes detected
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
            {outline.scenes.map((scene, index) => (
              <div
                key={index}
                className="p-3 aurora-bg rounded-lg space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-mono text-xs bg-purple-500/20 px-2 py-0.5 rounded">
                    {formatTimestamp(scene.timestamp)}
                  </span>
                  <span className="text-white/30 text-xs">Scene {index + 1}</span>
                </div>
                <p className="text-white text-sm">{scene.description}</p>
                <div className="flex items-start gap-1.5">
                  <svg className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-teal-400/80 text-xs">{scene.suggestion}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Regenerate button */}
          <button
            onClick={onGenerate}
            className="w-full py-2 text-sm text-white/50 hover:text-white/80 transition text-center"
          >
            Regenerate Outline
          </button>
        </div>
      )}
    </div>
  );
}

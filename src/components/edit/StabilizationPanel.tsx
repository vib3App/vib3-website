'use client';

interface StabilizationPanelProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  strength: number;
  onStrengthChange: (strength: number) => void;
}

const strengthLevels = [
  { value: 1, label: 'Low', description: 'Subtle smoothing, preserves camera movement' },
  { value: 2, label: 'Medium', description: 'Balanced stabilization for handheld footage' },
  { value: 3, label: 'High', description: 'Maximum stabilization, may crop edges' },
];

export function StabilizationPanel({
  enabled,
  onToggle,
  strength,
  onStrengthChange,
}: StabilizationPanelProps) {
  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Stabilization</h3>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            enabled ? 'bg-purple-500' : 'bg-white/20'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* Processing indicator */}
          <div className="flex items-center gap-3 px-3 py-2 bg-purple-500/10 rounded-lg">
            <svg
              className="w-4 h-4 text-purple-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-purple-300 text-sm">Analyzing motion...</span>
          </div>

          {/* Strength selector */}
          <div>
            <p className="text-white/50 text-sm mb-3">Strength</p>
            <div className="space-y-2">
              {strengthLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => onStrengthChange(level.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition ${
                    strength === level.value
                      ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-purple-500/40'
                      : 'glass hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        strength === level.value ? 'text-white' : 'text-white/60'
                      }`}
                    >
                      {level.label}
                    </span>
                    {strength === level.value && (
                      <svg
                        className="w-4 h-4 text-purple-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-white/30 text-xs mt-0.5">{level.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export note */}
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 rounded-lg">
            <svg
              className="w-4 h-4 text-amber-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-amber-300/80 text-xs">
              Stabilization will be applied during export
            </span>
          </div>
        </>
      )}

      {!enabled && (
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-white/40 text-sm">
            Enable stabilization to reduce camera shake in your video.
          </p>
          <p className="text-white/25 text-xs mt-1">
            Best for handheld or action footage with unwanted motion.
          </p>
        </div>
      )}
    </div>
  );
}

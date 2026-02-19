'use client';

type CutoutMode = 'off' | 'auto' | 'colorkey';

interface CutoutPanelProps {
  cutoutMode: CutoutMode;
  onModeChange: (mode: CutoutMode) => void;
  cutoutColor: string;
  onColorChange: (color: string) => void;
  cutoutSensitivity: number;
  onSensitivityChange: (sensitivity: number) => void;
}

const presetColors = [
  { label: 'Green', value: '#00ff00' },
  { label: 'Blue', value: '#0000ff' },
  { label: 'Red', value: '#ff0000' },
  { label: 'White', value: '#ffffff' },
  { label: 'Black', value: '#000000' },
];

export function CutoutPanel({
  cutoutMode,
  onModeChange,
  cutoutColor,
  onColorChange,
  cutoutSensitivity,
  onSensitivityChange,
}: CutoutPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">Cutout / Background Removal</h3>

      {/* Mode selector */}
      <div className="flex gap-2">
        {([
          { id: 'off', label: 'Off' },
          { id: 'auto', label: 'Auto (AI)' },
          { id: 'colorkey', label: 'Color Key' },
        ] as const).map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
              cutoutMode === mode.id
                ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white'
                : 'glass text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Auto mode */}
      {cutoutMode === 'auto' && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">AI Background Removal</p>
              <p className="text-white/40 text-xs">Processing...</p>
            </div>
          </div>
          <p className="text-white/30 text-xs">
            Uses TensorFlow.js body segmentation to automatically detect and remove the background.
            This works best with a single subject and good lighting. The effect will be applied
            in real-time during preview and baked in during export.
          </p>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 to-teal-400 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Color Key mode */}
      {cutoutMode === 'colorkey' && (
        <>
          {/* Color picker */}
          <div>
            <p className="text-white/50 text-sm mb-2">Key Color</p>
            <div className="flex gap-2 items-center">
              {presetColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onColorChange(c.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition ${
                    cutoutColor === c.value ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
              <input
                type="color"
                value={cutoutColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                title="Custom color"
              />
            </div>
          </div>

          {/* Sensitivity slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-sm">Sensitivity</span>
              <span className="text-white font-mono text-sm">{cutoutSensitivity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={cutoutSensitivity}
              onChange={(e) => onSensitivityChange(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Hint */}
          <div className="glass-card rounded-xl p-3">
            <p className="text-white/30 text-xs">
              Pick any color to key out from your video. For green screen footage, use the
              Green Screen tab instead for optimized chroma key processing.
            </p>
          </div>
        </>
      )}

      {cutoutMode === 'off' && (
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-white/40 text-sm">
            Select a mode above to remove the video background.
          </p>
          <p className="text-white/25 text-xs mt-1">
            &quot;Auto&quot; uses AI segmentation. &quot;Color Key&quot; lets you pick a specific color to remove.
          </p>
        </div>
      )}
    </div>
  );
}

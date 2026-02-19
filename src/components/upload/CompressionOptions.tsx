'use client';

interface CompressionOptionsProps {
  enabled: boolean;
  onToggle: () => void;
  targetBitrate: number;
  onBitrateChange: (bitrate: number) => void;
  originalSize: number | null;
}

const BITRATE_PRESETS = [
  { value: 1, label: 'Low', description: '1 Mbps' },
  { value: 3, label: 'Medium', description: '3 Mbps' },
  { value: 5, label: 'High', description: '5 Mbps' },
  { value: 10, label: 'Ultra', description: '10 Mbps' },
] as const;

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function estimateOutputSize(originalSize: number | null, targetBitrate: number): string | null {
  if (!originalSize) return null;
  // Rough estimation: assume original is ~8 Mbps average
  const ratio = targetBitrate / 8;
  const estimated = Math.round(originalSize * ratio);
  return formatFileSize(estimated);
}

function getQualityLabel(bitrate: number): string {
  if (bitrate <= 1) return 'Lighter';
  if (bitrate <= 3) return 'Balanced';
  if (bitrate <= 5) return 'Good';
  return 'Better Quality';
}

export function CompressionOptions({
  enabled,
  onToggle,
  targetBitrate,
  onBitrateChange,
  originalSize,
}: CompressionOptionsProps) {
  const estimatedSize = estimateOutputSize(originalSize, targetBitrate);

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium text-sm">Compress before upload</h3>
          <p className="text-white/30 text-xs mt-0.5">Reduce file size for faster uploads</p>
        </div>
        <button
          onClick={onToggle}
          className={`w-12 h-7 rounded-full transition-colors ${
            enabled ? 'bg-gradient-to-r from-purple-500 to-teal-400' : 'bg-white/20'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* Quality slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Lighter</span>
              <span className="text-white font-medium">{getQualityLabel(targetBitrate)}</span>
              <span className="text-white/40">Better Quality</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={targetBitrate}
              onChange={(e) => onBitrateChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Bitrate presets */}
          <div className="flex gap-2">
            {BITRATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onBitrateChange(preset.value)}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${
                  targetBitrate === preset.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <span className="text-xs font-medium block">{preset.label}</span>
                <span className="text-[10px] opacity-60">{preset.description}</span>
              </button>
            ))}
          </div>

          {/* Size estimation */}
          {originalSize && (
            <div className="flex items-center justify-between p-2 aurora-bg rounded-lg">
              <div className="text-xs">
                <span className="text-white/40">Original: </span>
                <span className="text-white/60 font-mono">{formatFileSize(originalSize)}</span>
              </div>
              {estimatedSize && (
                <div className="text-xs">
                  <span className="text-white/40">Estimated: </span>
                  <span className="text-teal-400 font-mono">{estimatedSize}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

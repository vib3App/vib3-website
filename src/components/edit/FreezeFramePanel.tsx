'use client';

interface FreezeFramePanelProps {
  currentTime: number;
  duration: number;
  freezeFrames: { time: number; duration: number }[];
  onAddFreezeFrame: (time: number, frameDuration: number) => void;
  onRemoveFreezeFrame: (index: number) => void;
  formatTime: (t: number) => string;
}

const freezeDurations = [0.5, 1, 2, 3, 5];

export function FreezeFramePanel({
  currentTime, duration, freezeFrames, onAddFreezeFrame, onRemoveFreezeFrame, formatTime,
}: FreezeFramePanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Freeze at {formatTime(currentTime)}
        </label>
        <div className="flex flex-wrap gap-2">
          {freezeDurations.map(d => (
            <button
              key={d}
              onClick={() => onAddFreezeFrame(currentTime, d)}
              disabled={currentTime >= duration}
              className="px-4 py-2 glass text-white rounded-lg text-sm hover:bg-white/10 disabled:opacity-30"
            >
              {d}s freeze
            </button>
          ))}
        </div>
        <p className="text-white/40 text-xs mt-2">
          Seek to a position, then tap a duration to insert a still frame.
        </p>
      </div>

      {freezeFrames.length > 0 && (
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Freeze Frames ({freezeFrames.length})
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {freezeFrames.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2 glass rounded-lg">
                <span className="text-white text-sm">
                  {formatTime(f.time)} — {f.duration}s hold
                </span>
                <button
                  onClick={() => onRemoveFreezeFrame(i)}
                  className="text-red-400 hover:text-red-300 text-sm px-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

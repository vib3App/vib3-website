'use client';

interface TransformPanelProps {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  onRotate: (deg: number) => void;
  onFlipH: () => void;
  onFlipV: () => void;
}

const ROTATIONS = [
  { label: '0°', value: 0 },
  { label: '90°', value: 90 },
  { label: '180°', value: 180 },
  { label: '270°', value: 270 },
];

export function TransformPanel({ rotation, flipH, flipV, onRotate, onFlipH, onFlipV }: TransformPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white text-sm font-medium mb-3">Rotation</h3>
        <div className="flex gap-2">
          {ROTATIONS.map(r => (
            <button
              key={r.value}
              onClick={() => onRotate(r.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                rotation === r.value
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onRotate((rotation + 90) % 360)}
            className="flex-1 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 text-sm"
          >
            Rotate CW
          </button>
          <button
            onClick={() => onRotate((rotation + 270) % 360)}
            className="flex-1 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 text-sm"
          >
            Rotate CCW
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-white text-sm font-medium mb-3">Flip</h3>
        <div className="flex gap-2">
          <button
            onClick={onFlipH}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              flipH ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Flip Horizontal
          </button>
          <button
            onClick={onFlipV}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              flipV ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Flip Vertical
          </button>
        </div>
      </div>
    </div>
  );
}

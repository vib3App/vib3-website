'use client';

import type { TextPathType } from '@/hooks/videoEditor/types';

interface TextPathSelectorProps {
  selectedPath: TextPathType;
  onPathChange: (path: TextPathType) => void;
  previewText: string;
}

interface PathOption {
  id: TextPathType;
  label: string;
  description: string;
  svgPath: string;
  viewBox: string;
}

const PATH_OPTIONS: PathOption[] = [
  {
    id: 'straight',
    label: 'Straight',
    description: 'Default horizontal text',
    svgPath: 'M 10 25 L 190 25',
    viewBox: '0 0 200 50',
  },
  {
    id: 'arc',
    label: 'Arc',
    description: 'Text follows an upward arc',
    svgPath: 'M 10 40 Q 100 0 190 40',
    viewBox: '0 0 200 50',
  },
  {
    id: 'wave',
    label: 'Wave',
    description: 'Text follows a sine wave',
    svgPath: 'M 10 25 C 50 0, 70 50, 100 25 C 130 0, 150 50, 190 25',
    viewBox: '0 0 200 50',
  },
  {
    id: 'circle',
    label: 'Circle',
    description: 'Text wraps around a circle',
    svgPath: 'M 25 50 A 25 25 0 1 1 24.99 50',
    viewBox: '0 0 100 100',
  },
  {
    id: 'spiral',
    label: 'Spiral',
    description: 'Text spirals inward',
    svgPath: 'M 10 50 C 10 10, 90 10, 90 50 C 90 80, 30 80, 30 50 C 30 30, 70 30, 70 50',
    viewBox: '0 0 100 100',
  },
];

function PathPreview({ option, text, isSelected }: { option: PathOption; text: string; isSelected: boolean }) {
  const pathId = `path-${option.id}`;

  return (
    <svg viewBox={option.viewBox} className="w-full h-full">
      <defs>
        <path id={pathId} d={option.svgPath} fill="none" />
      </defs>
      {/* Show the path line */}
      <path d={option.svgPath} fill="none"
        stroke={isSelected ? '#a855f7' : 'rgba(255,255,255,0.15)'}
        strokeWidth="1" strokeDasharray={isSelected ? '' : '2 2'} />
      {/* Text on path */}
      <text fill={isSelected ? '#ffffff' : 'rgba(255,255,255,0.5)'}
        fontSize={option.id === 'circle' || option.id === 'spiral' ? '8' : '10'}
        fontWeight="bold">
        <textPath href={`#${pathId}`} startOffset="0%">
          {text || 'Sample Text'}
        </textPath>
      </text>
    </svg>
  );
}

export function TextPathSelector({ selectedPath, onPathChange, previewText }: TextPathSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">Text Path</h3>
      <p className="text-white/30 text-xs">Choose how text flows along a path</p>

      <div className="grid grid-cols-2 gap-3">
        {PATH_OPTIONS.map(option => (
          <button key={option.id}
            onClick={() => onPathChange(option.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition ${
              selectedPath === option.id
                ? 'ring-2 ring-purple-500 bg-purple-500/10'
                : 'bg-white/5 hover:bg-white/10'
            }`}>
            <div className="w-full h-12">
              <PathPreview option={option} text={previewText} isSelected={selectedPath === option.id} />
            </div>
            <span className="text-xs text-white/70">{option.label}</span>
          </button>
        ))}
      </div>

      {selectedPath !== 'straight' && (
        <div className="glass-card rounded-xl p-3">
          <p className="text-white/50 text-sm">
            {PATH_OPTIONS.find(p => p.id === selectedPath)?.description}
          </p>
          <p className="text-white/30 text-xs mt-1">
            Text is rendered along an SVG path using &lt;textPath&gt;. Path applies to all text overlays.
          </p>
        </div>
      )}

      {/* Live preview */}
      {selectedPath !== 'straight' && previewText && (
        <div className="bg-black/40 rounded-xl p-4 flex items-center justify-center min-h-[80px]">
          <svg viewBox={PATH_OPTIONS.find(p => p.id === selectedPath)?.viewBox || '0 0 200 50'}
            className="w-full max-w-xs">
            <defs>
              <path id="preview-path"
                d={PATH_OPTIONS.find(p => p.id === selectedPath)?.svgPath || ''} fill="none" />
            </defs>
            <text fill="white" fontSize="12" fontWeight="bold">
              <textPath href="#preview-path" startOffset="0%">
                {previewText}
              </textPath>
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}

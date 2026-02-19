'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { SpeedKeyframe } from '@/hooks/videoEditor/types';

interface SpeedRampPanelProps {
  keyframes: SpeedKeyframe[];
  onKeyframesChange: (keyframes: SpeedKeyframe[]) => void;
  duration: number;
  formatTime: (s: number) => string;
}

const PRESETS = [
  { label: 'Linear', keyframes: [{ time: 0, speed: 1 }, { time: 1, speed: 1 }] },
  { label: 'Ramp Up', keyframes: [{ time: 0, speed: 0.5 }, { time: 0.5, speed: 1 }, { time: 1, speed: 2 }] },
  { label: 'Ramp Down', keyframes: [{ time: 0, speed: 2 }, { time: 0.5, speed: 1 }, { time: 1, speed: 0.5 }] },
  { label: 'V-Shape', keyframes: [{ time: 0, speed: 2 }, { time: 0.5, speed: 0.25 }, { time: 1, speed: 2 }] },
  { label: 'Peak', keyframes: [{ time: 0, speed: 0.5 }, { time: 0.5, speed: 3 }, { time: 1, speed: 0.5 }] },
  { label: 'Steps', keyframes: [
    { time: 0, speed: 1 }, { time: 0.25, speed: 2 },
    { time: 0.5, speed: 0.5 }, { time: 0.75, speed: 1.5 }, { time: 1, speed: 1 },
  ]},
];

const GRAPH_WIDTH = 320;
const GRAPH_HEIGHT = 120;
const PADDING = 20;

export function SpeedRampPanel({ keyframes, onKeyframesChange, duration, formatTime }: SpeedRampPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const maxSpeed = 4;
  const minSpeed = 0.25;

  const timeToX = useCallback((t: number) => PADDING + t * (GRAPH_WIDTH - 2 * PADDING), []);
  const speedToY = useCallback((s: number) => {
    const normalized = (s - minSpeed) / (maxSpeed - minSpeed);
    return GRAPH_HEIGHT - PADDING - normalized * (GRAPH_HEIGHT - 2 * PADDING);
  }, []);
  const xToTime = useCallback((x: number) => Math.max(0, Math.min(1, (x - PADDING) / (GRAPH_WIDTH - 2 * PADDING))), []);
  const yToSpeed = useCallback((y: number) => {
    const normalized = 1 - (y - PADDING) / (GRAPH_HEIGHT - 2 * PADDING);
    return Math.max(minSpeed, Math.min(maxSpeed, normalized * (maxSpeed - minSpeed) + minSpeed));
  }, []);

  const pathD = keyframes.length > 0
    ? keyframes.map((kf, i) => {
        const x = timeToX(kf.time);
        const y = speedToY(kf.speed);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      }).join(' ')
    : '';

  const handlePointerDown = useCallback((idx: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIdx(idx);
    setSelectedIdx(idx);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (draggingIdx === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newTime = xToTime(x);
    const newSpeed = yToSpeed(y);

    const updated = [...keyframes];
    // First and last points stay at time 0 and 1
    if (draggingIdx === 0) {
      updated[0] = { time: 0, speed: newSpeed };
    } else if (draggingIdx === keyframes.length - 1) {
      updated[draggingIdx] = { time: 1, speed: newSpeed };
    } else {
      const minT = updated[draggingIdx - 1].time + 0.01;
      const maxT = updated[draggingIdx + 1].time - 0.01;
      updated[draggingIdx] = {
        time: Math.max(minT, Math.min(maxT, newTime)),
        speed: newSpeed,
      };
    }
    onKeyframesChange(updated);
  }, [draggingIdx, keyframes, onKeyframesChange, xToTime, yToSpeed]);

  const handlePointerUp = useCallback(() => { setDraggingIdx(null); }, []);

  const addPoint = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingIdx !== null) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = xToTime(x);
    const speed = yToSpeed(y);
    const updated = [...keyframes, { time, speed }].sort((a, b) => a.time - b.time);
    onKeyframesChange(updated);
  }, [draggingIdx, keyframes, onKeyframesChange, xToTime, yToSpeed]);

  const removeSelected = useCallback(() => {
    if (selectedIdx === null || selectedIdx === 0 || selectedIdx === keyframes.length - 1) return;
    onKeyframesChange(keyframes.filter((_, i) => i !== selectedIdx));
    setSelectedIdx(null);
  }, [selectedIdx, keyframes, onKeyframesChange]);

  const applyPreset = useCallback((preset: typeof PRESETS[0]) => {
    onKeyframesChange(preset.keyframes.map(kf => ({ ...kf })));
    setSelectedIdx(null);
  }, [onKeyframesChange]);

  // Initialize with linear if empty
  useEffect(() => {
    if (keyframes.length === 0) {
      onKeyframesChange([{ time: 0, speed: 1 }, { time: 1, speed: 1 }]);
    }
  }, [keyframes.length, onKeyframesChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Speed Ramp</h3>
        {selectedIdx !== null && selectedIdx !== 0 && selectedIdx !== keyframes.length - 1 && (
          <button onClick={removeSelected} className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">
            Remove Point
          </button>
        )}
      </div>

      {/* Presets */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {PRESETS.map(preset => (
          <button key={preset.label} onClick={() => applyPreset(preset)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition">
            {preset.label}
          </button>
        ))}
      </div>

      {/* Graph */}
      <div className="glass-card rounded-xl p-3">
        <svg ref={svgRef} width={GRAPH_WIDTH} height={GRAPH_HEIGHT}
          className="w-full cursor-crosshair" viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          onClick={addPoint} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
          {/* Grid lines */}
          {[0.25, 0.5, 1, 2, 4].map(s => (
            <g key={s}>
              <line x1={PADDING} y1={speedToY(s)} x2={GRAPH_WIDTH - PADDING} y2={speedToY(s)}
                stroke="white" strokeOpacity={s === 1 ? 0.2 : 0.05} strokeDasharray={s === 1 ? '' : '2 2'} />
              <text x={PADDING - 4} y={speedToY(s) + 3} fill="white" fillOpacity={0.3}
                fontSize="8" textAnchor="end">{s}x</text>
            </g>
          ))}

          {/* Speed curve */}
          {pathD && (
            <>
              <path d={pathD + ` L ${timeToX(keyframes[keyframes.length - 1]?.time ?? 1)} ${GRAPH_HEIGHT - PADDING} L ${timeToX(0)} ${GRAPH_HEIGHT - PADDING} Z`}
                fill="url(#speedGrad)" opacity={0.3} />
              <path d={pathD} fill="none" stroke="#a855f7" strokeWidth={2} />
            </>
          )}

          {/* Control points */}
          {keyframes.map((kf, i) => (
            <circle key={i} cx={timeToX(kf.time)} cy={speedToY(kf.speed)} r={6}
              fill={selectedIdx === i ? '#a855f7' : '#7c3aed'} stroke="white" strokeWidth={2}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown(i, e)} />
          ))}

          <defs>
            <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>

        <div className="flex justify-between mt-1">
          <span className="text-white/30 text-[10px]">0:00</span>
          <span className="text-white/30 text-[10px]">{formatTime(duration / 2)}</span>
          <span className="text-white/30 text-[10px]">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Selected point info */}
      {selectedIdx !== null && keyframes[selectedIdx] && (
        <div className="flex gap-4 px-3 py-2 bg-white/5 rounded-lg">
          <div>
            <span className="text-white/40 text-xs">Time</span>
            <p className="text-white text-sm font-mono">
              {formatTime(keyframes[selectedIdx].time * duration)}
            </p>
          </div>
          <div>
            <span className="text-white/40 text-xs">Speed</span>
            <p className="text-white text-sm font-mono">{keyframes[selectedIdx].speed.toFixed(2)}x</p>
          </div>
        </div>
      )}

      <p className="text-white/25 text-xs">Click graph to add points. Drag to adjust. Speed ramp applied during export.</p>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import type { CurveSettings, CurvePoint } from '@/services/videoProcessor';
import { type Channel, identityCurves } from '@/utils/curves';

interface CurvesPanelProps {
  curves: CurveSettings;
  onCurvesChange: (c: CurveSettings) => void;
}

const SIZE = 240;
const PAD = 12;
const VIEW = SIZE + PAD * 2;

const CHANNELS: { id: Channel; label: string; stroke: string }[] = [
  { id: 'rgb', label: 'RGB', stroke: '#ffffff' },
  { id: 'r', label: 'R', stroke: '#f87171' },
  { id: 'g', label: 'G', stroke: '#4ade80' },
  { id: 'b', label: 'B', stroke: '#60a5fa' },
];

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Master + per-channel tone-curve editor. Drag points to reshape; click an
 * empty spot to add a point; double-click an interior point to remove it.
 * Endpoints stay pinned at x=0 and x=1 (output adjustable). The shared
 * `@/utils/curves` math keeps this in sync with the live preview and export.
 */
export function CurvesPanel({ curves, onCurvesChange }: CurvesPanelProps) {
  const [channel, setChannel] = useState<Channel>('rgb');
  const svgRef = useRef<SVGSVGElement>(null);
  const dragIdx = useRef<number | null>(null);

  const pts = curves[channel];
  const stroke = CHANNELS.find(c => c.id === channel)!.stroke;
  const setPts = (next: CurvePoint[]) => onCurvesChange({ ...curves, [channel]: next });

  const toPx = (p: CurvePoint) => ({ cx: PAD + p.x * SIZE, cy: PAD + (1 - p.y) * SIZE });

  const fromEvent = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    const sx = ((clientX - r.left) / r.width) * VIEW;
    const sy = ((clientY - r.top) / r.height) * VIEW;
    return {
      x: clamp((sx - PAD) / SIZE, 0, 1),
      y: clamp(1 - (sy - PAD) / SIZE, 0, 1),
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const i = dragIdx.current;
    if (i === null) return;
    const { x, y } = fromEvent(e.clientX, e.clientY);
    const next = pts.map(p => ({ ...p }));
    if (i === 0) {
      next[0] = { x: 0, y };
    } else if (i === pts.length - 1) {
      next[i] = { x: 1, y };
    } else {
      next[i] = { x: clamp(x, next[i - 1].x + 0.02, next[i + 1].x - 0.02), y };
    }
    setPts(next);
  };

  const addPoint = (e: React.MouseEvent) => {
    if (dragIdx.current !== null) return;
    const { x, y } = fromEvent(e.clientX, e.clientY);
    if (x <= 0.03 || x >= 0.97) return; // keep interior; endpoints are fixed
    const next = [...pts.map(p => ({ ...p })), { x, y }].sort((a, b) => a.x - b.x);
    setPts(next);
  };

  const removePoint = (i: number) => {
    if (i === 0 || i === pts.length - 1) return; // can't remove endpoints
    setPts(pts.filter((_, idx) => idx !== i));
  };

  const path = pts.map((p, i) => {
    const { cx, cy } = toPx(p);
    return `${i === 0 ? 'M' : 'L'} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Color Curves</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setPts([{ x: 0, y: 0 }, { x: 1, y: 1 }])}
            className="px-2 py-1 text-xs rounded-lg glass text-white/60 hover:text-white"
          >
            Reset {channel.toUpperCase()}
          </button>
          <button
            onClick={() => onCurvesChange(identityCurves())}
            className="px-2 py-1 text-xs rounded-lg glass text-white/60 hover:text-white"
          >
            Reset all
          </button>
        </div>
      </div>

      {/* Channel selector */}
      <div className="flex gap-2">
        {CHANNELS.map(c => (
          <button
            key={c.id}
            onClick={() => setChannel(c.id)}
            className={`flex-1 py-1.5 text-sm rounded-lg transition ${
              channel === c.id ? 'bg-purple-500 text-white' : 'glass text-white/50 hover:text-white'
            }`}
            style={channel === c.id ? undefined : { color: c.stroke }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Curve editor */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="w-full max-w-[280px] mx-auto block touch-none select-none rounded-xl bg-black/40 border border-white/10"
        onPointerMove={onPointerMove}
        onPointerUp={() => { dragIdx.current = null; }}
        onPointerLeave={() => { dragIdx.current = null; }}
        onClick={addPoint}
      >
        {/* grid */}
        {[0.25, 0.5, 0.75].map(g => (
          <g key={g} stroke="rgba(255,255,255,0.08)" strokeWidth={1}>
            <line x1={PAD + g * SIZE} y1={PAD} x2={PAD + g * SIZE} y2={PAD + SIZE} />
            <line x1={PAD} y1={PAD + g * SIZE} x2={PAD + SIZE} y2={PAD + g * SIZE} />
          </g>
        ))}
        {/* identity diagonal */}
        <line x1={PAD} y1={PAD + SIZE} x2={PAD + SIZE} y2={PAD} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 4" />
        {/* curve */}
        <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
        {/* control points */}
        {pts.map((p, i) => {
          const { cx, cy } = toPx(p);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={7}
              fill={stroke}
              stroke="#000"
              strokeWidth={1.5}
              className="cursor-pointer"
              onPointerDown={(e) => {
                e.stopPropagation();
                dragIdx.current = i;
                (e.target as SVGElement).setPointerCapture(e.pointerId);
              }}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => { e.stopPropagation(); removePoint(i); }}
            />
          );
        })}
      </svg>

      <p className="text-white/30 text-xs text-center">
        Drag points · tap empty space to add · double-tap a point to remove
      </p>
    </div>
  );
}

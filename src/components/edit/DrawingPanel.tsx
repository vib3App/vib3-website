'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface DrawingPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoWidth: number;
  videoHeight: number;
  onDrawingChange: (hasDrawing: boolean) => void;
}

const COLORS = ['#ffffff', '#ff0000', '#ff6b00', '#ffff00', '#00ff00', '#00bfff', '#8b00ff', '#ff69b4', '#000000'];
const BRUSH_SIZES = [2, 4, 8, 12, 20];
const TOOLS = [
  { id: 'pen', label: 'Pen', icon: '✏️' },
  { id: 'line', label: 'Line', icon: '📏' },
  { id: 'rect', label: 'Rect', icon: '⬜' },
  { id: 'circle', label: 'Circle', icon: '⭕' },
  { id: 'eraser', label: 'Eraser', icon: '🧹' },
] as const;

type ToolType = typeof TOOLS[number]['id'];

export function DrawingPanel({ canvasRef, videoWidth, videoHeight, onDrawingChange }: DrawingPanelProps) {
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<ToolType>('pen');
  const [opacity, setOpacity] = useState(1);
  const isDrawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef<ImageData | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = videoWidth || 1080;
    canvas.height = videoHeight || 1920;
  }, [canvasRef, videoWidth, videoHeight]);

  const getPos = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, [canvasRef]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    isDrawingRef.current = true;
    const pos = getPos(e);
    startPosRef.current = pos;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = opacity;
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = color;
    } else {
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [canvasRef, getPos, tool, brushSize, opacity, color]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const pos = getPos(e);

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (snapshotRef.current) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity;
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();

      const sx = startPosRef.current.x, sy = startPosRef.current.y;
      if (tool === 'line') {
        ctx.moveTo(sx, sy);
        ctx.lineTo(pos.x, pos.y);
      } else if (tool === 'rect') {
        ctx.rect(sx, sy, pos.x - sx, pos.y - sy);
      } else if (tool === 'circle') {
        const rx = Math.abs(pos.x - sx) / 2, ry = Math.abs(pos.y - sy) / 2;
        ctx.ellipse(sx + (pos.x - sx) / 2, sy + (pos.y - sy) / 2, rx, ry, 0, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
  }, [canvasRef, getPos, tool, brushSize, color, opacity]);

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
    snapshotRef.current = null;
    onDrawingChange(true);
  }, [onDrawingChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onDrawingChange(false);
  }, [canvasRef, onDrawingChange]);

  return (
    <div className="space-y-3">
      {/* Drawing canvas overlay — must be positioned over video by parent */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
        style={{ pointerEvents: tool ? 'auto' : 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Tools */}
      <div className="flex gap-1.5">
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`flex-1 py-1.5 rounded-lg text-center text-xs transition ${
              tool === t.id ? 'bg-purple-500/30 text-purple-300' : 'glass text-white/50 hover:text-white'
            }`}
          >
            <span className="text-sm">{t.icon}</span>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      {/* Colors */}
      <div className="flex items-center gap-2">
        <span className="text-white/40 text-xs">Color</span>
        <div className="flex gap-1.5">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition ${
                color === c ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Brush size */}
      <div className="flex items-center gap-3">
        <span className="text-white/40 text-xs w-8">Size</span>
        <div className="flex gap-2 items-center">
          {BRUSH_SIZES.map(s => (
            <button
              key={s}
              onClick={() => setBrushSize(s)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
                brushSize === s ? 'bg-purple-500/30' : 'glass'
              }`}
            >
              <div className="rounded-full bg-white" style={{ width: s, height: s }} />
            </button>
          ))}
        </div>
      </div>

      {/* Opacity + Clear */}
      <div className="flex items-center gap-3">
        <span className="text-white/40 text-xs w-8">Alpha</span>
        <input
          type="range" min={0.1} max={1} step={0.1} value={opacity}
          onChange={e => setOpacity(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
        />
        <span className="text-white/50 text-xs w-8 text-right">{Math.round(opacity * 100)}%</span>
        <button onClick={clearCanvas} className="px-3 py-1 text-red-400 text-xs hover:text-red-300">
          Clear
        </button>
      </div>
    </div>
  );
}

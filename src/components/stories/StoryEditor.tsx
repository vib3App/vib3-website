'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { EDITOR_FILTERS } from '@/hooks/videoEditor/types';

interface TextOverlay { id: string; text: string; x: number; y: number; color: string; fontSize: number; fontWeight: string; }
interface StickerOverlay { id: string; emoji: string; x: number; y: number; scale: number; }

interface DrawingPath { id: string; points: { x: number; y: number }[]; color: string; width: number; }

interface StoryEditorProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  onSave: (overlays: { texts: TextOverlay[]; stickers: StickerOverlay[]; filter?: string; drawings?: DrawingPath[] }) => void;
  onCancel: () => void;
  initialFilter?: string;
  initialTexts?: TextOverlay[];
  initialStickers?: StickerOverlay[];
}

const COLORS = ['#ffffff', '#000000', '#ff0000', '#ff6b00', '#ffff00', '#00ff00', '#00bfff', '#8b00ff', '#ff69b4'];
const STICKER_OPTIONS = ['😀', '😂', '❤️', '🔥', '✨', '🎉', '💯', '🙏', '👀', '💪', '🌈', '⚡'];
const BRUSH_SIZES = [2, 4, 8, 12];
const DISPLAY_FILTERS = EDITOR_FILTERS.slice(0, 16);

type EditorMode = 'view' | 'text' | 'sticker' | 'filter' | 'draw';

export function StoryEditor({ mediaUrl, mediaType, onSave, onCancel, initialFilter, initialTexts, initialStickers }: StoryEditorProps) {
  const [texts, setTexts] = useState<TextOverlay[]>(initialTexts || []);
  const [stickers, setStickers] = useState<StickerOverlay[]>(initialStickers || []);
  const [drawings, setDrawings] = useState<DrawingPath[]>([]);
  const [mode, setMode] = useState<EditorMode>('view');
  const [newText, setNewText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [activeFilter, setActiveFilter] = useState(initialFilter || 'none');
  const [drawColor, setDrawColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentPathRef = useRef<DrawingPath | null>(null);

  // Setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    [...drawings, currentPathRef.current].filter(Boolean).forEach(path => {
      if (!path || path.points.length < 2) return;
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });
  }, [drawings]);

  const addText = useCallback(() => {
    if (!newText.trim()) return;
    setTexts(prev => [...prev, { id: `txt-${Date.now()}`, text: newText.trim(), x: 50, y: 50, color: textColor, fontSize: 24, fontWeight: 'bold' }]);
    setNewText(''); setMode('view');
  }, [newText, textColor]);

  const addSticker = useCallback((emoji: string) => {
    setStickers(prev => [...prev, { id: `stk-${Date.now()}`, emoji, x: 50, y: 50, scale: 1 }]);
    setMode('view');
  }, []);

  const moveOverlay = useCallback((type: 'text' | 'sticker', id: string, cx: number, cy: number) => {
    const c = containerRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((cx - r.left) / r.width) * 100));
    const y = Math.max(5, Math.min(95, ((cy - r.top) / r.height) * 100));
    if (type === 'text') setTexts(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
    else setStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  }, []);

  const removeOverlay = useCallback((type: 'text' | 'sticker', id: string) => {
    if (type === 'text') setTexts(prev => prev.filter(t => t.id !== id));
    else setStickers(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleDrawStart = useCallback((cx: number, cy: number) => {
    if (mode !== 'draw') return;
    const cv = canvasRef.current; if (!cv) return;
    const r = cv.getBoundingClientRect();
    currentPathRef.current = { id: `drw-${Date.now()}`, points: [{ x: cx - r.left, y: cy - r.top }], color: drawColor, width: brushSize };
    setIsDrawing(true);
  }, [mode, drawColor, brushSize]);

  const handleDrawMove = useCallback((cx: number, cy: number) => {
    if (!isDrawing || !currentPathRef.current) return;
    const cv = canvasRef.current; if (!cv) return;
    const r = cv.getBoundingClientRect();
    currentPathRef.current.points.push({ x: cx - r.left, y: cy - r.top });
    redrawCanvas();
  }, [isDrawing, redrawCanvas]);

  const handleDrawEnd = useCallback(() => {
    if (!isDrawing || !currentPathRef.current) return;
    if (currentPathRef.current.points.length >= 2) setDrawings(prev => [...prev, currentPathRef.current!]);
    currentPathRef.current = null; setIsDrawing(false); redrawCanvas();
  }, [isDrawing, redrawCanvas]);

  const undoDrawing = useCallback(() => setDrawings(prev => prev.slice(0, -1)), []);
  useEffect(() => { redrawCanvas(); }, [drawings, redrawCanvas]);
  const toggleMode = (m: EditorMode) => setMode(mode === m ? 'view' : m);

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <button onClick={onCancel} className="text-white px-4 py-2 glass rounded-full text-sm">Cancel</button>
        <div className="flex gap-2">
          {(['text', 'sticker', 'filter', 'draw'] as EditorMode[]).map(m => (
            <button key={m} onClick={() => toggleMode(m)}
              className={`px-3 py-1.5 rounded-full text-sm ${mode === m ? 'bg-purple-500 text-white' : 'glass text-white'}`}
            >
              {m === 'text' ? 'Aa' : m === 'sticker' ? '😀' : m === 'filter' ? '🎨' : '✏️'}
            </button>
          ))}
        </div>
        <button onClick={() => onSave({ texts, stickers, filter: activeFilter, drawings })}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full text-sm font-medium">
          Done
        </button>
      </div>

      {/* Media + overlays */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {mediaType === 'video' ? (
          <video src={mediaUrl} className="w-full h-full object-cover" style={{ filter: activeFilter }} autoPlay loop muted playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl} alt="Story" className="w-full h-full object-cover" style={{ filter: activeFilter }} />
        )}

        {/* Drawing canvas */}
        <canvas ref={canvasRef} className={`absolute inset-0 ${mode === 'draw' ? 'z-10' : 'z-10 pointer-events-none'}`}
          onPointerDown={e => handleDrawStart(e.clientX, e.clientY)}
          onPointerMove={e => handleDrawMove(e.clientX, e.clientY)}
          onPointerUp={handleDrawEnd} onPointerLeave={handleDrawEnd}
        />

        {/* Text overlays */}
        {texts.map(t => (
          <div key={t.id} className="absolute cursor-move select-none touch-none group z-20"
            style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
            onPointerDown={e => {
              if (mode === 'draw') return;
              e.preventDefault();
              const el = e.currentTarget;
              el.setPointerCapture(e.pointerId);
              const onMove = (ev: PointerEvent) => moveOverlay('text', t.id, ev.clientX, ev.clientY);
              const onUp = () => el.removeEventListener('pointermove', onMove);
              el.addEventListener('pointermove', onMove);
              el.addEventListener('pointerup', onUp, { once: true });
            }}>
            <span style={{ color: t.color, fontSize: t.fontSize, fontWeight: t.fontWeight, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{t.text}</span>
            <button onClick={() => removeOverlay('text', t.id)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs hidden group-hover:flex items-center justify-center">x</button>
          </div>
        ))}

        {/* Sticker overlays */}
        {stickers.map(s => (
          <div key={s.id} className="absolute cursor-move select-none touch-none group z-20"
            style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `translate(-50%, -50%) scale(${s.scale})`, fontSize: '48px' }}
            onPointerDown={e => {
              if (mode === 'draw') return;
              e.preventDefault();
              const el = e.currentTarget;
              el.setPointerCapture(e.pointerId);
              const onMove = (ev: PointerEvent) => moveOverlay('sticker', s.id, ev.clientX, ev.clientY);
              const onUp = () => el.removeEventListener('pointermove', onMove);
              el.addEventListener('pointermove', onMove);
              el.addEventListener('pointerup', onUp, { once: true });
            }}>
            {s.emoji}
            <button onClick={() => removeOverlay('sticker', s.id)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs hidden group-hover:flex items-center justify-center">x</button>
          </div>
        ))}
      </div>

      {/* Text panel */}
      {mode === 'text' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 glass-card z-20">
          <div className="flex gap-2 mb-3">
            {COLORS.map(c => (
              <button key={c} onClick={() => setTextColor(c)}
                className={`w-7 h-7 rounded-full border-2 ${textColor === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newText} onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addText()}
              placeholder="Type your text..." className="flex-1 glass text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/40" autoFocus />
            <button onClick={addText} className="px-4 py-3 bg-purple-500 text-white rounded-xl">Add</button>
          </div>
        </div>
      )}

      {/* Sticker panel */}
      {mode === 'sticker' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 glass-card z-20">
          <div className="grid grid-cols-6 gap-3">
            {STICKER_OPTIONS.map(emoji => (
              <button key={emoji} onClick={() => addSticker(emoji)} className="text-3xl p-2 rounded-lg hover:bg-white/10 transition">{emoji}</button>
            ))}
          </div>
        </div>
      )}

      {/* Filter panel */}
      {mode === 'filter' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 glass-card z-20">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {DISPLAY_FILTERS.map(f => (
              <button key={f.name} onClick={() => setActiveFilter(f.filter)}
                className={`flex-shrink-0 text-center ${activeFilter === f.filter ? 'opacity-100' : 'opacity-60'}`}>
                <div className={`w-14 h-18 rounded-lg overflow-hidden mb-1 ${activeFilter === f.filter ? 'ring-2 ring-purple-500' : ''}`}>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500" style={{ filter: f.filter }} />
                </div>
                <span className="text-white text-[10px]">{f.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Draw panel */}
      {mode === 'draw' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 glass-card z-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setDrawColor(c)}
                  className={`w-7 h-7 rounded-full border-2 ${drawColor === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <button onClick={undoDrawing} className="text-white/70 text-sm px-3 py-1 glass rounded-full">Undo</button>
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-white/50 text-xs">Size:</span>
            {BRUSH_SIZES.map(s => (
              <button key={s} onClick={() => setBrushSize(s)}
                className={`rounded-full ${brushSize === s ? 'bg-white' : 'bg-white/30'}`}
                style={{ width: s + 8, height: s + 8 }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

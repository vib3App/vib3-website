'use client';

import { useState, useMemo, useCallback } from 'react';
import type { CaptionWord } from '@/hooks/videoEditor/types';

interface CaptionEntry {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface KaraokeCaptionPreviewProps {
  captions: CaptionEntry[];
  currentTime: number;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  highlightColor: string;
  onHighlightColorChange: (color: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#facc15' },
  { label: 'Cyan', value: '#22d3ee' },
  { label: 'Pink', value: '#f472b6' },
  { label: 'Green', value: '#4ade80' },
  { label: 'Orange', value: '#fb923c' },
  { label: 'White', value: '#ffffff' },
  { label: 'Purple', value: '#c084fc' },
];

function splitCaptionIntoWords(caption: CaptionEntry): CaptionWord[] {
  const words = caption.text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return [];

  const totalDuration = caption.endTime - caption.startTime;
  const wordDuration = totalDuration / words.length;

  return words.map((word, i) => ({
    word,
    startTime: caption.startTime + i * wordDuration,
    endTime: caption.startTime + (i + 1) * wordDuration,
  }));
}

export function KaraokeCaptionPreview({
  captions, currentTime, enabled, onToggle,
  highlightColor, onHighlightColorChange, fontSize, onFontSizeChange,
}: KaraokeCaptionPreviewProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Find the active caption at currentTime
  const activeCaption = useMemo(() => {
    return captions.find(c => currentTime >= c.startTime && currentTime <= c.endTime) || null;
  }, [captions, currentTime]);

  // Split active caption into words with timing
  const words = useMemo(() => {
    if (!activeCaption) return [];
    return splitCaptionIntoWords(activeCaption);
  }, [activeCaption]);

  const getWordStyle = useCallback((word: CaptionWord): React.CSSProperties => {
    const isActive = currentTime >= word.startTime && currentTime < word.endTime;
    const isPast = currentTime >= word.endTime;

    if (isActive) {
      return {
        color: highlightColor,
        transform: 'scale(1.15)',
        transition: 'all 0.15s ease',
        textShadow: `0 0 12px ${highlightColor}60`,
      };
    }
    if (isPast) {
      return {
        color: highlightColor,
        opacity: 0.7,
        transition: 'all 0.15s ease',
      };
    }
    return {
      color: 'rgba(255,255,255,0.5)',
      transition: 'all 0.15s ease',
    };
  }, [currentTime, highlightColor]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Karaoke Captions</h3>
        <div className="flex gap-2 items-center">
          {enabled && (
            <button onClick={() => setShowSettings(!showSettings)}
              className="text-xs px-2 py-1 rounded-lg bg-white/10 text-white/60 hover:text-white">
              Settings
            </button>
          )}
          <button onClick={() => onToggle(!enabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              enabled ? 'bg-purple-500' : 'bg-white/20'
            }`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {captions.length === 0 && (
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-white/40 text-sm">No captions available.</p>
          <p className="text-white/25 text-xs mt-1">
            Generate captions first using the Captions tab, then enable karaoke mode.
          </p>
        </div>
      )}

      {enabled && captions.length > 0 && (
        <>
          {/* Live preview */}
          <div className="bg-black/60 rounded-xl p-6 min-h-[80px] flex items-center justify-center">
            {words.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 justify-center" style={{ fontSize }}>
                {words.map((w, i) => (
                  <span key={`${w.word}-${i}`} className="inline-block font-bold"
                    style={getWordStyle(w)}>
                    {w.word}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/20 text-sm">
                Play video to see karaoke preview
              </p>
            )}
          </div>

          {/* Settings */}
          {showSettings && (
            <div className="space-y-3">
              {/* Highlight color */}
              <div>
                <p className="text-white/40 text-xs mb-2">Highlight Color</p>
                <div className="flex gap-2 items-center">
                  {HIGHLIGHT_COLORS.map(c => (
                    <button key={c.value} onClick={() => onHighlightColorChange(c.value)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        highlightColor === c.value ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.value }} title={c.label} />
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/40 text-xs">Font Size</span>
                  <span className="text-white font-mono text-xs">{fontSize}px</span>
                </div>
                <input type="range" min="14" max="48" value={fontSize}
                  onChange={e => onFontSizeChange(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500" />
              </div>
            </div>
          )}

          {/* Caption timeline */}
          <div className="space-y-1 max-h-28 overflow-y-auto scrollbar-hide">
            {captions.map(c => {
              const isActive = currentTime >= c.startTime && currentTime <= c.endTime;
              return (
                <div key={c.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive ? 'bg-purple-500/20 ring-1 ring-purple-500/40' : 'bg-white/5'
                  }`}>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
                  <span className="text-white/60 text-xs font-mono min-w-[40px]">
                    {c.startTime.toFixed(1)}s
                  </span>
                  <span className={`text-sm flex-1 truncate ${isActive ? 'text-white' : 'text-white/40'}`}>
                    {c.text}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

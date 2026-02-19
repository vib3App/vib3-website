'use client';

import { useState, useCallback, useRef } from 'react';
import { detectBeats } from '@/services/audioProcessing/index';

interface BeatSyncPanelProps {
  duration: number;
  beatMarkers: number[];
  onBeatMarkersChange: (markers: number[]) => void;
  formatTime: (t: number) => string;
}

export function BeatSyncPanel({ duration, beatMarkers, onBeatMarkersChange, formatTime }: BeatSyncPanelProps) {
  const [bpm, setBpm] = useState(120);
  const [isDetecting, setIsDetecting] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const lastTapRef = useRef(0);

  // Manual BPM -> generate beat markers
  const generateMarkers = useCallback((tempo: number) => {
    if (tempo <= 0 || duration <= 0) return;
    const interval = 60 / tempo;
    const markers: number[] = [];
    for (let t = 0; t < duration; t += interval) {
      markers.push(Math.round(t * 1000) / 1000);
    }
    onBeatMarkersChange(markers);
  }, [duration, onBeatMarkersChange]);

  // Real beat detection using audioProcessing service
  const detectBPM = useCallback(async () => {
    setIsDetecting(true);
    setConfidence(null);
    try {
      const video = document.querySelector('video');
      if (!video || !video.src) { setIsDetecting(false); return; }

      const result = await detectBeats(video.src);

      if (result.beatTimestamps.length > 0) {
        setBpm(result.bpm);
        setConfidence(result.confidence);

        // Use actual detected beat timestamps if confidence is good
        if (result.confidence > 0.3) {
          const filteredBeats = result.beatTimestamps.filter(t => t < duration);
          onBeatMarkersChange(filteredBeats);
        } else {
          // Low confidence: use detected BPM with regular intervals
          generateMarkers(result.bpm);
        }
      } else {
        // No beats found, fallback to manual
        generateMarkers(bpm);
      }
    } catch {
      // Fallback: keep manual BPM
      generateMarkers(bpm);
    } finally {
      setIsDetecting(false);
    }
  }, [generateMarkers, onBeatMarkersChange, duration, bpm]);

  // Tap tempo
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current > 3000) {
      setTapTimes([now]);
    } else {
      const newTaps = [...tapTimes, now].slice(-8);
      setTapTimes(newTaps);
      if (newTaps.length >= 2) {
        const intervals = newTaps.slice(1).map((t, i) => t - newTaps[i]);
        const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const tappedBPM = Math.round(60000 / avgMs);
        setBpm(tappedBPM);
      }
    }
    lastTapRef.current = now;
  }, [tapTimes]);

  return (
    <div className="space-y-4">
      {/* BPM Controls */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-white text-sm font-medium mb-1">BPM</label>
          <input
            type="number" min={40} max={300} value={bpm}
            onChange={e => setBpm(parseInt(e.target.value) || 120)}
            className="w-full glass text-white px-3 py-2 rounded-lg outline-none text-sm"
          />
        </div>
        <button
          onClick={handleTap}
          className="px-4 py-2 mt-5 glass text-white rounded-lg text-sm hover:bg-white/10 active:bg-white/20"
        >
          Tap Tempo
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={detectBPM}
          disabled={isDetecting}
          className="flex-1 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 disabled:opacity-50"
        >
          {isDetecting ? 'Analyzing Audio...' : 'Auto-Detect BPM'}
        </button>
        <button
          onClick={() => generateMarkers(bpm)}
          className="flex-1 px-4 py-2 bg-teal-500/20 text-teal-300 rounded-lg text-sm hover:bg-teal-500/30"
        >
          Generate Cuts
        </button>
      </div>

      {/* Confidence indicator */}
      {confidence !== null && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/40">Detection confidence:</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                confidence > 0.6 ? 'bg-green-400' : confidence > 0.3 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <span className="text-white/40">{Math.round(confidence * 100)}%</span>
        </div>
      )}

      {/* Beat markers */}
      {beatMarkers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-white text-sm font-medium">
              {beatMarkers.length} beat markers
            </label>
            <button onClick={() => onBeatMarkersChange([])} className="text-red-400 text-xs hover:text-red-300">
              Clear All
            </button>
          </div>
          {/* Visual beat marker bar */}
          <div className="h-8 glass rounded-lg relative overflow-hidden">
            {beatMarkers.map((t, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-0.5 bg-purple-400"
                style={{ left: `${(t / duration) * 100}%` }}
              />
            ))}
          </div>
          <p className="text-white/40 text-xs mt-1">
            {bpm} BPM -- cuts every {(60 / bpm).toFixed(2)}s
          </p>
        </div>
      )}
    </div>
  );
}

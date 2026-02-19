'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVoices, speak, stopSpeaking, generateAudioBlob, isTTSAvailable } from '@/services/tts';

interface NarrationPanelProps {
  onNarrationGenerated: (blob: Blob, text: string) => void;
  hasNarration: boolean;
  onDiscard: () => void;
}

export function NarrationPanel({
  onNarrationGenerated,
  hasNarration,
  onDiscard,
}: NarrationPanelProps) {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Load voices
  useEffect(() => {
    setIsAvailable(isTTSAvailable());
    if (!isTTSAvailable()) return;

    getVoices().then((v) => {
      setVoices(v);
      // Default to first English voice
      const enIndex = v.findIndex((voice) => voice.lang.startsWith('en'));
      if (enIndex >= 0) setSelectedVoiceIndex(enIndex);
    });
  }, []);

  const handlePreview = useCallback(async () => {
    if (!text.trim()) return;
    if (isPreviewing) {
      stopSpeaking();
      setIsPreviewing(false);
      return;
    }

    setIsPreviewing(true);
    try {
      await speak(text, {
        voice: voices[selectedVoiceIndex] || null,
        rate,
        pitch,
        volume,
      });
    } catch {
      // ignore
    } finally {
      setIsPreviewing(false);
    }
  }, [text, voices, selectedVoiceIndex, rate, pitch, volume, isPreviewing]);

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    try {
      const blob = await generateAudioBlob(text, {
        voice: voices[selectedVoiceIndex] || null,
        rate,
        pitch,
        volume,
      });
      onNarrationGenerated(blob, text);
    } catch {
      // Fallback: just call speak for audible output
      await speak(text, {
        voice: voices[selectedVoiceIndex] || null,
        rate,
        pitch,
        volume,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [text, voices, selectedVoiceIndex, rate, pitch, volume, onNarrationGenerated]);

  if (!isAvailable) {
    return (
      <div className="text-center py-8">
        <p className="text-white/50 text-sm">Text-to-Speech is not available in this browser.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-white text-sm font-medium">AI Narration</h3>

      {/* Text input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter narration text..."
        rows={3}
        className="w-full aurora-bg text-white px-3 py-2 rounded-lg text-sm outline-none placeholder:text-white/30 resize-none"
      />

      {/* Voice selector */}
      {voices.length > 0 && (
        <div>
          <label className="text-white/50 text-xs block mb-1">Voice</label>
          <select
            value={selectedVoiceIndex}
            onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
            className="w-full aurora-bg text-white px-3 py-2 rounded-lg text-sm outline-none"
          >
            {voices.map((voice, i) => (
              <option key={`${voice.name}-${i}`} value={i}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Rate slider */}
      <SliderControl label="Rate" value={rate} min={0.5} max={2} step={0.1} onChange={setRate} />

      {/* Pitch slider */}
      <SliderControl label="Pitch" value={pitch} min={0} max={2} step={0.1} onChange={setPitch} />

      {/* Volume slider */}
      <SliderControl label="Volume" value={volume} min={0} max={1} step={0.05} onChange={setVolume} />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handlePreview}
          disabled={!text.trim()}
          className={`flex-1 py-2 rounded-lg text-sm transition ${
            isPreviewing
              ? 'bg-orange-500 text-white'
              : 'bg-white/10 text-white hover:bg-white/15 disabled:opacity-30'
          }`}
        >
          {isPreviewing ? 'Stop Preview' : 'Preview'}
        </button>
        <button
          onClick={handleGenerate}
          disabled={!text.trim() || isGenerating}
          className="flex-1 py-2 bg-purple-500 text-white rounded-lg text-sm disabled:opacity-30 transition"
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* Discard if has narration */}
      {hasNarration && (
        <button
          onClick={onDiscard}
          className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition"
        >
          Discard Narration
        </button>
      )}
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/50 text-xs w-12">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-purple-500"
      />
      <span className="text-white text-xs w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

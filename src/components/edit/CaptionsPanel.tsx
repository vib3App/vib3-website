'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface CaptionEntry {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface CaptionsPanelProps {
  captions: CaptionEntry[];
  onCaptionsChange: (captions: CaptionEntry[]) => void;
  captionStyle: string;
  onCaptionStyleChange: (style: string) => void;
  currentTime: number;
  formatTime: (s: number) => string;
}

const captionStyles = [
  { id: 'default', label: 'Default', className: 'text-white text-lg font-bold' },
  { id: 'outline', label: 'Outline', className: 'text-white text-lg font-bold [text-shadow:_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]' },
  { id: 'box', label: 'Box', className: 'text-white text-lg font-bold bg-black/70 px-2 py-1' },
  { id: 'neon', label: 'Neon', className: 'text-green-400 text-lg font-bold [text-shadow:_0_0_10px_#22c55e]' },
  { id: 'karaoke', label: 'Karaoke', className: 'text-yellow-400 text-xl font-extrabold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)]' },
  { id: 'minimal', label: 'Minimal', className: 'text-white/80 text-base font-medium' },
];

const languages = [
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'pt-BR', label: 'Portuguese' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'ko-KR', label: 'Korean' },
  { code: 'zh-CN', label: 'Chinese' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ar-SA', label: 'Arabic' },
];

export function CaptionsPanel({
  captions, onCaptionsChange, captionStyle, onCaptionStyleChange, currentTime, formatTime,
}: CaptionsPanelProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const captionIdRef = useRef(0);

  const speechSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startTranscription = useCallback(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript.trim();
          if (text) {
            const id = `cap-${++captionIdRef.current}`;
            const entry: CaptionEntry = {
              id,
              text,
              startTime: currentTime,
              endTime: currentTime + 3,
            };
            onCaptionsChange([...captions, entry]);
          }
        }
      }
    };

    recognition.onerror = () => setIsTranscribing(false);
    recognition.onend = () => setIsTranscribing(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsTranscribing(true);
  }, [language, currentTime, captions, onCaptionsChange]);

  const stopTranscription = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsTranscribing(false);
  }, []);

  const removeCaption = useCallback((id: string) => {
    onCaptionsChange(captions.filter(c => c.id !== id));
  }, [captions, onCaptionsChange]);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Auto-Captions</h3>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 outline-none"
        >
          {languages.map(l => (
            <option key={l.code} value={l.code} className="bg-gray-900">{l.label}</option>
          ))}
        </select>
      </div>

      {!speechSupported ? (
        <p className="text-red-400 text-sm">Speech recognition not supported in this browser.</p>
      ) : (
        <div className="flex gap-3">
          {!isTranscribing ? (
            <button onClick={startTranscription}
              className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors">
              Start Transcription
            </button>
          ) : (
            <button onClick={stopTranscription}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Stop Transcription
            </button>
          )}
        </div>
      )}

      {/* Caption styles */}
      <div>
        <p className="text-white/40 text-xs mb-2">Style</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {captionStyles.map(s => (
            <button
              key={s.id}
              onClick={() => onCaptionStyleChange(s.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition ${
                captionStyle === s.id ? 'ring-2 ring-purple-500 bg-purple-500/20' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className={s.className} style={{ fontSize: '12px' }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Caption list */}
      {captions.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-hide">
          {captions.map(c => (
            <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg group">
              <span className="text-white/40 text-xs font-mono min-w-[80px]">
                {formatTime(c.startTime)}
              </span>
              <span className="text-white text-sm flex-1 truncate">{c.text}</span>
              <button onClick={() => removeCaption(c.id)}
                className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

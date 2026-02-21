'use client';

import { useState, useCallback, useRef } from 'react';
import { translateText } from '@/services/translation';
import { logger } from '@/utils/logger';

interface CaptionEntry {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface TranslationTrack {
  language: string;
  languageLabel: string;
  captions: CaptionEntry[];
}

interface CaptionTranslationPanelProps {
  sourceCaptions: CaptionEntry[];
  translationTracks: TranslationTrack[];
  onTranslationTracksChange: (tracks: TranslationTrack[]) => void;
  formatTime: (s: number) => string;
}

const LANGUAGES = [
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'ru', label: 'Russian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'tr', label: 'Turkish' },
  { code: 'pl', label: 'Polish' },
  { code: 'sv', label: 'Swedish' },
  { code: 'da', label: 'Danish' },
  { code: 'fi', label: 'Finnish' },
  { code: 'no', label: 'Norwegian' },
  { code: 'th', label: 'Thai' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ms', label: 'Malay' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'cs', label: 'Czech' },
];

export function CaptionTranslationPanel({
  sourceCaptions, translationTracks, onTranslationTracksChange, formatTime,
}: CaptionTranslationPanelProps) {
  const [selectedLang, setSelectedLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [viewingTrack, setViewingTrack] = useState<string | null>(null);
  const abortRef = useRef(false);

  const alreadyTranslated = translationTracks.map(t => t.language);
  const availableLanguages = LANGUAGES.filter(l => !alreadyTranslated.includes(l.code));

  const handleTranslate = useCallback(async () => {
    if (sourceCaptions.length === 0) {
      setError('No source captions to translate. Generate captions first.');
      return;
    }

    setIsTranslating(true);
    setError(null);
    setProgress(0);
    abortRef.current = false;

    const langLabel = LANGUAGES.find(l => l.code === selectedLang)?.label || selectedLang;
    const translated: CaptionEntry[] = [];

    try {
      for (let i = 0; i < sourceCaptions.length; i++) {
        if (abortRef.current) break;
        const cap = sourceCaptions[i];
        const text = await translateText(cap.text, selectedLang);
        translated.push({ ...cap, id: `${cap.id}-${selectedLang}`, text });
        setProgress(Math.round(((i + 1) / sourceCaptions.length) * 100));
      }

      if (!abortRef.current) {
        const newTrack: TranslationTrack = {
          language: selectedLang,
          languageLabel: langLabel,
          captions: translated,
        };
        onTranslationTracksChange([...translationTracks, newTrack]);
        setViewingTrack(selectedLang);
      }
    } catch (err) {
      logger.error('Caption translation failed:', err);
      setError('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  }, [sourceCaptions, selectedLang, translationTracks, onTranslationTracksChange]);

  const handleRemoveTrack = useCallback((lang: string) => {
    onTranslationTracksChange(translationTracks.filter(t => t.language !== lang));
    if (viewingTrack === lang) setViewingTrack(null);
  }, [translationTracks, onTranslationTracksChange, viewingTrack]);

  const activeTrack = translationTracks.find(t => t.language === viewingTrack);

  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">Caption Translation</h3>

      {sourceCaptions.length === 0 ? (
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-white/40 text-sm">No captions available.</p>
          <p className="text-white/25 text-xs mt-1">Generate captions first, then translate them here.</p>
        </div>
      ) : (
        <>
          {/* Language selector + translate button */}
          <div className="flex gap-2">
            <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
              disabled={isTranslating || availableLanguages.length === 0}
              className="flex-1 bg-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none disabled:opacity-50">
              {availableLanguages.map(l => (
                <option key={l.code} value={l.code} className="bg-gray-900">{l.label}</option>
              ))}
              {availableLanguages.length === 0 && (
                <option className="bg-gray-900">All languages translated</option>
              )}
            </select>
            <button onClick={handleTranslate}
              disabled={isTranslating || availableLanguages.length === 0}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition disabled:opacity-50">
              {isTranslating ? `${progress}%` : 'Translate'}
            </button>
          </div>

          {/* Progress bar */}
          {isTranslating && (
            <div className="space-y-1">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all"
                  style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between">
                <span className="text-white/30 text-xs">Translating captions...</span>
                <button onClick={() => { abortRef.current = true; }}
                  className="text-red-400 text-xs hover:text-red-300">Cancel</button>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Translation tracks */}
          {translationTracks.length > 0 && (
            <div>
              <p className="text-white/40 text-xs mb-2">Translation Tracks</p>
              <div className="flex flex-wrap gap-2">
                {translationTracks.map(track => (
                  <div key={track.language}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      viewingTrack === track.language
                        ? 'bg-purple-500/20 ring-1 ring-purple-500/40 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}>
                    <button onClick={() => setViewingTrack(
                      viewingTrack === track.language ? null : track.language
                    )} className="text-sm">
                      {track.languageLabel}
                    </button>
                    <button onClick={() => handleRemoveTrack(track.language)}
                      className="text-white/30 hover:text-red-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View track captions */}
          {activeTrack && (
            <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-hide">
              {activeTrack.captions.map(c => (
                <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                  <span className="text-white/40 text-xs font-mono min-w-[50px]">
                    {formatTime(c.startTime)}
                  </span>
                  <span className="text-white text-sm flex-1 truncate">{c.text}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <p className="text-white/20 text-xs">
        Uses LibreTranslate API. Translations are cached locally.
      </p>
    </div>
  );
}

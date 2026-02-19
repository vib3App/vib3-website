'use client';

import { useState, useEffect } from 'react';

interface CodecOption {
  id: string;
  name: string;
  description: string;
  compatibility: string;
  mimeType: string;
  estimatedRatio: number; // relative to H.264 baseline
}

interface CodecSelectorProps {
  selectedCodec: string;
  onCodecChange: (codec: string) => void;
}

const CODEC_OPTIONS: CodecOption[] = [
  {
    id: 'h264',
    name: 'H.264',
    description: 'Most compatible, widely supported',
    compatibility: 'All browsers and devices',
    mimeType: 'video/mp4; codecs="avc1.42E01E"',
    estimatedRatio: 1.0,
  },
  {
    id: 'h265',
    name: 'H.265 / HEVC',
    description: 'Smaller file size at same quality',
    compatibility: 'Safari, some Chromium browsers',
    mimeType: 'video/mp4; codecs="hvc1.1.6.L93.B0"',
    estimatedRatio: 0.6,
  },
  {
    id: 'vp9',
    name: 'VP9',
    description: 'Open source, good compression',
    compatibility: 'Chrome, Firefox, Edge',
    mimeType: 'video/webm; codecs="vp9"',
    estimatedRatio: 0.65,
  },
  {
    id: 'av1',
    name: 'AV1',
    description: 'Best quality/size ratio, newer standard',
    compatibility: 'Chrome 70+, Firefox 67+',
    mimeType: 'video/mp4; codecs="av01.0.05M.08"',
    estimatedRatio: 0.5,
  },
];

function checkCodecSupport(mimeType: string): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof MediaRecorder === 'undefined') return false;
  try {
    return MediaRecorder.isTypeSupported(mimeType);
  } catch {
    return false;
  }
}

function getFileSizeBadge(ratio: number): string {
  if (ratio >= 1.0) return '100%';
  return `~${Math.round(ratio * 100)}%`;
}

export function CodecSelector({ selectedCodec, onCodecChange }: CodecSelectorProps) {
  const [supported, setSupported] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const result: Record<string, boolean> = {};
    for (const codec of CODEC_OPTIONS) {
      result[codec.id] = checkCodecSupport(codec.mimeType);
    }
    // H.264 is always effectively supported for upload purposes
    result['h264'] = true;
    setSupported(result);
  }, []);

  return (
    <div className="space-y-3">
      <label className="text-white font-medium text-sm">Export Codec</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CODEC_OPTIONS.map((codec) => {
          const isSupported = supported[codec.id] ?? true;
          const isSelected = selectedCodec === codec.id;

          return (
            <button
              key={codec.id}
              onClick={() => isSupported && onCodecChange(codec.id)}
              disabled={!isSupported}
              className={`relative p-3 rounded-xl text-left transition ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-500/30 to-teal-400/30 border border-purple-500/50'
                  : isSupported
                    ? 'glass hover:bg-white/10'
                    : 'glass opacity-40 cursor-not-allowed'
              }`}
              title={!isSupported ? 'Not supported in your browser' : undefined}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                      {codec.name}
                    </span>
                    {codec.id === 'h264' && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-teal-500/20 text-teal-400 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{codec.description}</p>
                  <p className="text-white/25 text-[10px] mt-1">{codec.compatibility}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                    codec.estimatedRatio < 0.7
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {getFileSizeBadge(codec.estimatedRatio)}
                  </span>
                  {!isSupported && (
                    <span className="text-[10px] text-red-400">Unsupported</span>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

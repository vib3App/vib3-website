'use client';

import { useState, useCallback } from 'react';
import { videoDownloadService } from '@/services/videoDownload';
import type { DownloadProgress } from '@/services/videoDownload';

interface DownloadModalProps {
  videoId: string;
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

type QualityOption = 'original' | 'hd' | 'sd';
type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

const QUALITY_OPTIONS: { id: QualityOption; label: string; description: string }[] = [
  { id: 'original', label: 'Original', description: 'Full quality, largest file size' },
  { id: 'hd', label: 'HD (720p)', description: 'Good quality, smaller file size' },
  { id: 'sd', label: 'SD (480p)', description: 'Smaller file, good for sharing' },
];

const POSITION_OPTIONS: { id: WatermarkPosition; label: string }[] = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'center', label: 'Center' },
];

export function DownloadModal({ videoId, videoUrl, isOpen, onClose }: DownloadModalProps) {
  const [quality, setQuality] = useState<QualityOption>('original');
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    setDownloadComplete(false);
    setProgress(null);

    try {
      const qualitySuffix = quality === 'original' ? '' : `-${quality}`;
      const filename = `vib3-video-${videoId}${qualitySuffix}.mp4`;

      await videoDownloadService.downloadVideo(videoUrl, videoId, {
        filename,
        onProgress: (p) => setProgress(p),
      });

      setDownloadComplete(true);
    } catch {
      // Error handled by service
    } finally {
      setDownloading(false);
    }
  }, [videoId, videoUrl, quality]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50 bg-neutral-900 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-white font-semibold text-lg">Download Video</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Quality Selection */}
          <div>
            <label className="text-white text-sm font-medium block mb-2">Quality</label>
            <div className="space-y-2">
              {QUALITY_OPTIONS.map((opt) => (
                <button key={opt.id} onClick={() => setQuality(opt.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                    quality === opt.id ? 'bg-purple-500/20 border border-purple-500/30' : 'glass hover:bg-white/5'
                  }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    quality === opt.id ? 'border-purple-500' : 'border-white/20'
                  }`}>
                    {quality === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm">{opt.label}</p>
                    <p className="text-white/40 text-xs">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Watermark Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white text-sm font-medium">Watermark</span>
                <p className="text-white/40 text-xs">Add VIB3 watermark to video</p>
              </div>
              <button onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                className={`w-10 h-5 rounded-full transition ${watermarkEnabled ? 'bg-purple-500' : 'bg-white/20'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  watermarkEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {watermarkEnabled && (
              <div className="space-y-3 pl-2 border-l-2 border-purple-500/30">
                {/* Position */}
                <div>
                  <label className="text-white/60 text-xs block mb-1.5">Position</label>
                  <div className="flex flex-wrap gap-1.5">
                    {POSITION_OPTIONS.map((pos) => (
                      <button key={pos.id} onClick={() => setWatermarkPosition(pos.id)}
                        className={`px-2.5 py-1 text-xs rounded-lg transition ${
                          watermarkPosition === pos.id ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-white/50'
                        }`}>{pos.label}</button>
                    ))}
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-white/60 text-xs">Opacity</label>
                    <span className="text-white/40 text-xs">{watermarkOpacity}%</span>
                  </div>
                  <input type="range" min="10" max="100" step="5" value={watermarkOpacity}
                    onChange={e => setWatermarkOpacity(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500" />
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          {downloading && progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Downloading...</span>
                <span className="text-white/60">{progress.percent}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-teal-500 rounded-full transition-all"
                  style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          )}

          {/* Complete */}
          {downloadComplete && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-xl">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 text-sm">Video saved to Downloads!</span>
            </div>
          )}

          {/* Download Button */}
          <button onClick={handleDownload} disabled={downloading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50 hover:opacity-90 transition">
            {downloading ? 'Downloading...' : downloadComplete ? 'Download Again' : 'Save Video'}
          </button>
        </div>
      </div>
    </>
  );
}

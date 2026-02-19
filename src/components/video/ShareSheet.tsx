'use client';

import { useState, useCallback } from 'react';
import { videoProcessor } from '@/services/videoProcessor';

interface ShareSheetProps {
  videoId: string;
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onShareComplete?: () => void;
}

// Gap #47: Platform-specific sharing URLs
function getPlatformShareUrl(platform: string, shareUrl: string, text: string): string {
  const encoded = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(text);
  switch (platform) {
    case 'whatsapp': return `https://wa.me/?text=${encodedText}%20${encoded}`;
    case 'twitter': return `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedText}`;
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    case 'telegram': return `https://t.me/share/url?url=${encoded}&text=${encodedText}`;
    case 'reddit': return `https://reddit.com/submit?url=${encoded}&title=${encodedText}`;
    default: return '';
  }
}

export function ShareSheet({ videoId, videoUrl, isOpen, onClose, onShareComplete }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/video/${videoId}` : '';
  const shareText = 'Check this out on VIB3!';

  const trackShare = useCallback(() => {
    if (!hasShared) { setHasShared(true); onShareComplete?.(); }
  }, [hasShared, onShareComplete]);

  // Gap #46: Extract audio from video using FFmpeg.wasm
  const handleExtractAudio = useCallback(async () => {
    if (extracting) return;
    setExtracting(true);
    try {
      const blob = await videoProcessor.extractAudio(videoUrl);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vib3-audio-${videoId}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ }
    finally { setExtracting(false); }
  }, [videoUrl, videoId, extracting]);

  const handleAction = async (action: string) => {
    if (['copy', 'email', 'sms', 'messages', 'embed', 'whatsapp', 'twitter', 'facebook', 'telegram', 'reddit'].includes(action)) {
      trackShare();
    }

    switch (action) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true); setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
        break;
      case 'email':
        window.open(`mailto:?subject=Check this out on VIB3&body=${encodeURIComponent(shareUrl)}`, '_self');
        onClose(); break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_self');
        onClose(); break;
      case 'whatsapp': case 'twitter': case 'facebook': case 'telegram': case 'reddit':
        window.open(getPlatformShareUrl(action, shareUrl, shareText), '_blank');
        onClose(); break;
      case 'embed':
        try {
          const embedCode = `<iframe src="${shareUrl}/embed" width="325" height="580" frameborder="0" allowfullscreen></iframe>`;
          await navigator.clipboard.writeText(embedCode);
          setCopied(true); setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
        break;
      case 'extract': handleExtractAudio(); break;
      case 'download': window.open(videoUrl, '_blank'); break;
      case 'report': break;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 rounded-t-3xl animate-slide-up">
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-4 pb-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Share</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Platform Share Buttons - Gap #47 */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-white/40 text-xs mb-2">Share to</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {PLATFORM_OPTIONS.map((p) => (
              <button key={p.action} onClick={() => handleAction(p.action)}
                className="flex flex-col items-center gap-1.5 min-w-[60px]">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${p.bg}`}>
                  <span className="text-white text-lg font-bold">{p.icon}</span>
                </div>
                <span className="text-white/60 text-[10px]">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* More Actions */}
        <div className="grid grid-cols-4 gap-4 p-4 border-t border-white/5">
          {SHARE_OPTIONS.map((option) => (
            <button key={option.name} onClick={() => handleAction(option.action)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-white">
                {option.svgIcon}
              </div>
              <span className="text-white/70 text-xs">
                {option.action === 'copy' && copied ? 'Copied!' :
                 option.action === 'extract' && extracting ? 'Working...' : option.name}
              </span>
            </button>
          ))}
        </div>

        {/* Link Preview */}
        <div className="px-4 pb-6">
          <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
            <input type="text" value={shareUrl} readOnly
              className="flex-1 bg-transparent text-white/50 text-sm outline-none" />
            <button onClick={() => handleAction('copy')}
              className="text-purple-400 text-sm font-semibold">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const PLATFORM_OPTIONS = [
  { name: 'WhatsApp', action: 'whatsapp', bg: 'bg-green-600', icon: 'W' },
  { name: 'Twitter', action: 'twitter', bg: 'bg-sky-500', icon: 'X' },
  { name: 'Facebook', action: 'facebook', bg: 'bg-blue-600', icon: 'f' },
  { name: 'Telegram', action: 'telegram', bg: 'bg-sky-400', icon: 'T' },
  { name: 'Reddit', action: 'reddit', bg: 'bg-orange-600', icon: 'R' },
  { name: 'SMS', action: 'sms', bg: 'bg-green-500', icon: 'S' },
];

const iconSvg = (d: string) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const SHARE_OPTIONS = [
  { name: 'Copy Link', action: 'copy', svgIcon: iconSvg('M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z') },
  { name: 'Embed', action: 'embed', svgIcon: iconSvg('M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4') },
  { name: 'Email', action: 'email', svgIcon: iconSvg('M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z') },
  { name: 'Extract Audio', action: 'extract', svgIcon: iconSvg('M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z') },
  { name: 'Download', action: 'download', svgIcon: iconSvg('M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4') },
  { name: 'Report', action: 'report', svgIcon: iconSvg('M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z') },
];

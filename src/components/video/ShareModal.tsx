'use client';

import { useState } from 'react';
import { videoApi } from '@/services/api';

interface ShareModalProps {
  videoId: string;
  videoUrl: string;
  caption: string;
  isOpen: boolean;
  onClose: () => void;
}

const shareOptions = [
  { id: 'copy', label: 'Copy Link', icon: '🔗' },
  { id: 'twitter', label: 'Twitter/X', icon: '𝕏' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'telegram', label: 'Telegram', icon: '✈️' },
  { id: 'email', label: 'Email', icon: '📧' },
];

export function ShareModal({ videoId, videoUrl, caption, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://vib3app.net/v/${videoId}`;

  const handleShare = async (platform: string) => {
    // Record share
    try {
      await videoApi.shareVideo(videoId, platform);
    } catch (err) {
      console.error('Failed to record share:', err);
    }

    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    let url = '';
    const text = encodeURIComponent(caption || 'Check out this video on VIB3!');
    const encodedUrl = encodeURIComponent(shareUrl);

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${text}%20${encodedUrl}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedUrl}&text=${text}`;
        break;
      case 'email':
        url = `mailto:?subject=${text}&body=${text}%20${encodedUrl}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    onClose();
  };

  // Try native share API first on mobile
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VIB3 Video',
          text: caption || 'Check out this video on VIB3!',
          url: shareUrl,
        });
        await videoApi.shareVideo(videoId, 'native');
        onClose();
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm glass-card rounded-2xl p-6 animate-scale-in">
        <h2 className="text-white font-semibold text-lg text-center mb-6">Share Video</h2>

        {/* Native share button (mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full mb-4 py-3 bg-gradient-to-r from-purple-500 to-teal-400 rounded-xl text-white font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        )}

        {/* Share options grid */}
        <div className="grid grid-cols-3 gap-4">
          {shareOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleShare(option.id)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="text-white/70 text-xs">
                {option.id === 'copy' && copied ? 'Copied!' : option.label}
              </span>
            </button>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

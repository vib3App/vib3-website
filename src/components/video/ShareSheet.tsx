'use client';

import { useState } from 'react';

interface ShareSheetProps {
  videoId: string;
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const shareOptions = [
  {
    name: 'Copy Link',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    action: 'copy',
  },
  {
    name: 'Messages',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    action: 'messages',
  },
  {
    name: 'Email',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    action: 'email',
  },
  {
    name: 'SMS',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    action: 'sms',
  },
  {
    name: 'Embed',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    action: 'embed',
  },
  {
    name: 'QR Code',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    action: 'qr',
  },
  {
    name: 'Download',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    action: 'download',
  },
  {
    name: 'Report',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    action: 'report',
  },
];

export function ShareSheet({ videoId, videoUrl, isOpen, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/video/${videoId}` : '';

  const handleAction = async (action: string) => {
    switch (action) {
      case 'copy':
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case 'email':
        window.location.href = `mailto:?subject=Check this out on VIB3&body=${encodeURIComponent(shareUrl)}`;
        onClose();
        break;
      case 'sms':
        window.location.href = `sms:?body=${encodeURIComponent(shareUrl)}`;
        onClose();
        break;
      case 'messages':
        // Open in-app messages
        break;
      case 'embed':
        const embedCode = `<iframe src="${shareUrl}/embed" width="325" height="580" frameborder="0" allowfullscreen></iframe>`;
        await navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case 'qr':
        // Show QR code modal
        break;
      case 'download':
        window.open(videoUrl, '_blank');
        break;
      case 'report':
        // Open report modal
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0E1A] rounded-t-3xl animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Share</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-4 gap-4 p-4">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => handleAction(option.action)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#1A1F2E] flex items-center justify-center text-white">
                {option.icon}
              </div>
              <span className="text-white/70 text-xs">
                {(option.action === 'copy' || option.action === 'embed') && copied ? 'Copied!' : option.name}
              </span>
            </button>
          ))}
        </div>

        {/* Link Preview */}
        <div className="px-4 pb-6">
          <div className="flex items-center gap-3 p-3 bg-[#1A1F2E] rounded-xl">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-white/50 text-sm outline-none"
            />
            <button
              onClick={() => handleAction('copy')}
              className="text-[#6366F1] text-sm font-semibold"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useRef } from 'react';
import { QRGenerator } from './QRGenerator';

interface ShareQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export function ShareQRModal({ isOpen, onClose, url, title }: ShareQRModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'vib3-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-6 max-w-sm w-full" ref={containerRef}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">{title || 'Share QR Code'}</h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center mb-4 p-4 bg-white rounded-xl">
            <QRGenerator value={url} size={200} />
          </div>

          <p className="text-white/50 text-sm text-center mb-4 break-all">{url}</p>

          <div className="flex gap-3">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2.5 glass text-white text-sm font-medium rounded-xl hover:bg-white/10 transition"
            >
              Copy Link
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 text-white text-sm font-medium rounded-xl"
            >
              Download QR
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

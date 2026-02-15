'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { logger } from '@/utils/logger';

interface ProfileQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    username: string;
    displayName?: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  profileUrl: string;
}

export function ProfileQRModal({
  isOpen,
  onClose,
  profile,
  profileUrl,
}: ProfileQRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Generate QR code using Canvas API
    const generateQR = async () => {
      try {
        // Use a simple QR code generation approach
        // In production, you'd use a library like qrcode
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}&bgcolor=1A1F2E&color=ffffff`;
        setQrDataUrl(qrApiUrl);
      } catch (err) {
        logger.error('Failed to generate QR code:', err);
      }
    };

    generateQR();
  }, [isOpen, profileUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName || profile.username} on VIB3`,
          text: `Check out @${profile.username} on VIB3`,
          url: profileUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          logger.error('Share failed:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `vib3-${profile.username}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gradient-to-b from-purple-500 to-teal-400 rounded-3xl w-full max-w-sm p-1">
        <div className="glass rounded-3xl p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Profile Info */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden aurora-bg mb-3">
              {profile.profilePicture ? (
                <Image
                  src={profile.profilePicture}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/50">
                  {(profile.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <h3 className="text-white font-semibold text-lg">
                {profile.displayName || profile.username}
              </h3>
              {profile.isVerified && (
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="text-white/50 text-sm">@{profile.username}</p>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-4 mb-6">
            {qrDataUrl ? (
              <div className="relative w-full aspect-square">
                <Image
                  src={qrDataUrl}
                  alt="Profile QR Code"
                  fill
                  className="object-contain"
                  unoptimized
                />
                {/* Center logo overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-teal-400 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">V</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-square flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Instructions */}
          <p className="text-white/50 text-center text-sm mb-6">
            Scan this QR code to view this profile
          </p>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 aurora-bg text-white py-3 rounded-xl hover:aurora-bg/80 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>

          {/* Download QR */}
          <button
            onClick={handleDownloadQR}
            className="w-full mt-3 text-purple-400 text-sm font-medium hover:underline"
          >
            Download QR Code
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

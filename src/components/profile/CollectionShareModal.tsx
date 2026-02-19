'use client';

import { useState } from 'react';
import { logger } from '@/utils/logger';

interface CollectionShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: {
    id: string;
    name: string;
    isPublic?: boolean;
  };
}

/**
 * Gap #63: Collection Sharing
 * Modal for sharing a collection via link, social, or embedding.
 */
export function CollectionShareModal({ isOpen, onClose, collection }: CollectionShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/collections/${collection.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${collection.name} - VIB3 Collection`,
          text: `Check out this collection on VIB3`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') logger.error('Share failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-sm">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-white font-semibold text-lg mb-1">Share Collection</h3>
        <p className="text-white/50 text-sm mb-5">{collection.name}</p>

        {!collection.isPublic && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-4">
            <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-yellow-300/80 text-xs">This collection is private. Others won&apos;t be able to view it unless you make it public.</p>
          </div>
        )}

        {/* Link */}
        <div className="flex items-center gap-2 mb-4">
          <input type="text" readOnly value={shareUrl}
            className="flex-1 bg-white/5 text-white/70 text-sm rounded-xl px-3 py-2.5 outline-none border border-white/10" />
          <button onClick={handleCopy}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${copied ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'}`}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-3 glass rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out this VIB3 collection: ${collection.name}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 glass rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Post
          </a>
        </div>
      </div>
    </div>
  );
}

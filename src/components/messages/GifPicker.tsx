'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

interface GiphyGif {
  id: string;
  images: {
    fixed_height: { url: string; width: string; height: string };
    original: { url: string };
  };
  title: string;
}

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || '';

// Fallback sticker grid when no GIPHY API key is available
const STICKER_EMOJIS = [
  '\u{1F44D}', '\u{1F44E}', '\u{2764}\u{FE0F}', '\u{1F525}', '\u{1F602}', '\u{1F62D}',
  '\u{1F60D}', '\u{1F914}', '\u{1F92F}', '\u{1F389}', '\u{1F44F}', '\u{1F64F}',
  '\u{1F60E}', '\u{1F921}', '\u{1F47B}', '\u{1F680}', '\u{1F31F}', '\u{1F308}',
  '\u{1F984}', '\u{1F436}', '\u{1F431}', '\u{1F37F}', '\u{1F382}', '\u{1F3B5}',
  '\u{1F4AA}', '\u{1F918}', '\u{270C}\u{FE0F}', '\u{1F91D}', '\u{1F917}', '\u{1F92B}',
  '\u{1F48E}', '\u{1F3C6}', '\u{26A1}', '\u{1F4A5}', '\u{1F4AF}', '\u{1F440}',
];

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const hasApiKey = !!GIPHY_API_KEY;

  const fetchGifs = useCallback(async (searchQuery: string) => {
    if (!hasApiKey) return;
    setIsLoading(true);
    try {
      const endpoint = searchQuery
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=20&rating=pg`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=pg`;
      const resp = await fetch(endpoint);
      const data = await resp.json();
      setGifs(data.data || []);
    } catch (err) {
      logger.error('Failed to fetch GIFs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hasApiKey]);

  // Load trending on mount
  useEffect(() => {
    if (hasApiKey) fetchGifs('');
  }, [hasApiKey, fetchGifs]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGifs(value);
    }, 400);
  }, [fetchGifs]);

  const handleGifSelect = useCallback((gif: GiphyGif) => {
    onSelect(gif.images.fixed_height.url);
  }, [onSelect]);

  const handleStickerSelect = useCallback((emoji: string) => {
    onSelect(emoji);
  }, [onSelect]);

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 max-h-80 glass-heavy rounded-2xl border border-white/10 shadow-xl overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-white text-sm font-medium">
          {hasApiKey ? 'GIFs' : 'Stickers'}
        </span>
        <button onClick={onClose} className="text-white/40 hover:text-white text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {hasApiKey ? (
        <>
          {/* Search bar */}
          <div className="p-2 border-b border-white/5">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search GIFs..."
              className="w-full bg-white/5 text-white text-sm px-3 py-1.5 rounded-lg outline-none placeholder:text-white/30 focus:ring-1 focus:ring-purple-500"
              autoFocus
            />
          </div>

          {/* GIF grid */}
          <div className="overflow-y-auto max-h-56 p-2">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-white/20 border-t-purple-400 rounded-full animate-spin" />
              </div>
            ) : gifs.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-6">
                {query ? 'No GIFs found' : 'Loading...'}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {gifs.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => handleGifSelect(gif)}
                    className="rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-400 transition-all"
                  >
                    <img
                      src={gif.images.fixed_height.url}
                      alt={gif.title}
                      className="w-full h-24 object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GIPHY attribution */}
          <div className="px-3 py-1 border-t border-white/5 flex justify-end">
            <span className="text-white/20 text-[10px]">Powered by GIPHY</span>
          </div>
        </>
      ) : (
        /* Sticker grid fallback */
        <div className="overflow-y-auto max-h-60 p-3">
          <p className="text-white/30 text-xs mb-2">Stickers</p>
          <div className="grid grid-cols-6 gap-1">
            {STICKER_EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => handleStickerSelect(emoji)}
                className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-white/10 rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

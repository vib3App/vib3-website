'use client';

import { useState, useCallback, useRef } from 'react';
import type { GiphyStickerOverlay } from '@/hooks/videoEditor/types';

interface GiphyStickerPanelProps {
  stickers: GiphyStickerOverlay[];
  onAddSticker: (sticker: Omit<GiphyStickerOverlay, 'id' | 'x' | 'y' | 'scale'>) => void;
  onRemoveSticker: (id: string) => void;
}

interface GiphyGif {
  id: string;
  title: string;
  images: {
    fixed_height_small: { url: string; width: string; height: string };
    fixed_height: { url: string; width: string; height: string };
    original: { url: string; width: string; height: string };
  };
}

// Use env key or fall back to GIPHY public beta key for development
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'dc6zaTOxFJmzC';
const GIPHY_SEARCH_URL = 'https://api.giphy.com/v1/gifs/search';
const GIPHY_TRENDING_URL = 'https://api.giphy.com/v1/gifs/trending';

export function GiphyStickerPanel({ stickers, onAddSticker, onRemoveSticker }: GiphyStickerPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GiphyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchGifs = useCallback(async (searchQuery: string) => {
    if (!GIPHY_API_KEY) {
      setError('GIPHY API key not configured. Set NEXT_PUBLIC_GIPHY_API_KEY.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const url = searchQuery.trim()
        ? `${GIPHY_SEARCH_URL}?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=24&rating=g`
        : `${GIPHY_TRENDING_URL}?api_key=${GIPHY_API_KEY}&limit=24&rating=g`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('GIPHY request failed');
      const data = await res.json();
      setResults(data.data || []);
      setHasSearched(true);
    } catch (e) {
      setError('Failed to fetch GIFs. Check your connection.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchGifs(value), 500);
  }, [fetchGifs]);

  const handleSelect = useCallback((gif: GiphyGif) => {
    const img = gif.images.fixed_height;
    onAddSticker({
      url: img.url,
      width: parseInt(img.width) || 200,
      height: parseInt(img.height) || 200,
    });
  }, [onAddSticker]);

  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">GIPHY Stickers</h3>

      {/* Search */}
      <div className="relative">
        <input type="text" value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search GIPHY stickers..."
          className="w-full aurora-bg text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30 pr-10"
          autoFocus />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Trending button */}
      {!hasSearched && !isLoading && (
        <button onClick={() => fetchGifs('')}
          className="w-full py-3 border border-dashed border-white/20 text-white/50 rounded-xl hover:border-white/40 transition">
          Load Trending GIFs
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="px-3 py-2 bg-red-500/10 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-hide">
          {results.map(gif => (
            <button key={gif.id} onClick={() => handleSelect(gif)}
              className="aspect-square rounded-lg overflow-hidden bg-white/5 hover:ring-2 hover:ring-purple-500 transition">
              <img src={gif.images.fixed_height_small.url} alt={gif.title}
                className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {hasSearched && results.length === 0 && !isLoading && !error && (
        <p className="text-white/30 text-sm text-center py-4">No results found. Try different keywords.</p>
      )}

      {/* Added stickers */}
      {stickers.length > 0 && (
        <div className="pt-3 border-t border-white/10">
          <h4 className="text-sm text-white/50 mb-2">Added ({stickers.length})</h4>
          <div className="flex flex-wrap gap-2">
            {stickers.map(s => (
              <div key={s.id} className="relative group">
                <img src={s.url} alt="sticker" className="w-12 h-12 rounded-lg object-cover" />
                <button onClick={() => onRemoveSticker(s.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  x
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-2">Drag stickers on the video to reposition</p>
        </div>
      )}

      {/* GIPHY attribution */}
      <div className="text-center">
        <span className="text-white/20 text-[10px]">Powered by GIPHY</span>
      </div>
    </div>
  );
}

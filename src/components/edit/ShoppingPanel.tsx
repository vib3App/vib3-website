'use client';

import { useState, useCallback } from 'react';
import { shopApi } from '@/services/api';

export interface ProductTag {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  timestamp: number;
  duration: number;
}

interface ShoppingPanelProps {
  currentTime: number;
  videoDuration: number;
  productTags: ProductTag[];
  onProductTagsChange: (tags: ProductTag[]) => void;
  formatTime: (t: number) => string;
}

interface SearchResult {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export function ShoppingPanel({
  currentTime,
  videoDuration,
  productTags,
  onProductTagsChange,
  formatTime,
}: ShoppingPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tagDuration, setTagDuration] = useState(5);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await shopApi.getProducts({ search: searchQuery, limit: 10 });
      setSearchResults(
        (response.products || []).map((p) => ({
          id: p._id || '',
          name: p.name,
          price: p.price,
          imageUrl: p.images?.[0]?.url || p.imageUrl || '',
        }))
      );
    } catch {
      // Use mock data on API failure
      setSearchResults([
        { id: 'mock-1', name: 'VIB3 Hoodie', price: 49.99, imageUrl: '' },
        { id: 'mock-2', name: 'VIB3 Cap', price: 24.99, imageUrl: '' },
        { id: 'mock-3', name: 'VIB3 Tee', price: 29.99, imageUrl: '' },
      ]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const addProductTag = useCallback(
    (product: SearchResult) => {
      const newTag: ProductTag = {
        id: `ptag-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        timestamp: currentTime,
        duration: Math.min(tagDuration, videoDuration - currentTime),
      };
      onProductTagsChange([...productTags, newTag]);
    },
    [currentTime, videoDuration, tagDuration, productTags, onProductTagsChange]
  );

  const removeTag = useCallback(
    (tagId: string) => {
      onProductTagsChange(productTags.filter((t) => t.id !== tagId));
    },
    [productTags, onProductTagsChange]
  );

  return (
    <div className="space-y-3">
      <h3 className="text-white text-sm font-medium">Shopping Tags</h3>

      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search products..."
          className="flex-1 aurora-bg text-white px-3 py-2 rounded-lg text-sm outline-none placeholder:text-white/30"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm disabled:opacity-50"
        >
          {isSearching ? '...' : 'Search'}
        </button>
      </div>

      {/* Tag duration */}
      <div className="flex items-center gap-2">
        <span className="text-white/50 text-xs">Display duration:</span>
        <input
          type="range"
          min={1}
          max={15}
          value={tagDuration}
          onChange={(e) => setTagDuration(Number(e.target.value))}
          className="flex-1 accent-purple-500"
        />
        <span className="text-white text-xs w-6 text-right">{tagDuration}s</span>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-hide">
          <p className="text-white/40 text-xs">Tap to tag at {formatTime(currentTime)}</p>
          {searchResults.map((product) => (
            <button
              key={product.id}
              onClick={() => addProductTag(product)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition text-left"
            >
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center shrink-0">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                ) : (
                  <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{product.name}</p>
                <p className="text-teal-400 text-xs">${product.price.toFixed(2)}</p>
              </div>
              <span className="text-purple-400 text-xs">+ Add</span>
            </button>
          ))}
        </div>
      )}

      {/* Active tags */}
      {productTags.length > 0 && (
        <div className="space-y-1">
          <p className="text-white/40 text-xs">Active tags ({productTags.length})</p>
          {productTags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{tag.name}</p>
                <p className="text-white/40 text-xs">
                  {formatTime(tag.timestamp)} - {formatTime(tag.timestamp + tag.duration)} | ${tag.price.toFixed(2)}
                </p>
              </div>
              <button onClick={() => removeTag(tag.id)} className="text-red-400 text-xs hover:text-red-300">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {productTags.length === 0 && searchResults.length === 0 && (
        <p className="text-white/30 text-xs text-center py-4">
          Search for products to tag in your video
        </p>
      )}
    </div>
  );
}

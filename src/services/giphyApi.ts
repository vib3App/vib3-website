/**
 * GIPHY API Service - Gap #24
 * Fetches real stickers/GIFs from GIPHY API.
 * Uses NEXT_PUBLIC_GIPHY_API_KEY from env, with public beta key as fallback.
 */

import { logger } from '@/utils/logger';

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'dc6zaTOxFJmzC';
const BASE_URL = 'https://api.giphy.com/v1';

export interface GiphyResult {
  id: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
  title: string;
}

interface GiphyApiGif {
  id: string;
  title: string;
  images: {
    fixed_height_small: { url: string; width: string; height: string };
    fixed_height: { url: string; width: string; height: string };
    original: { url: string; width: string; height: string };
  };
}

function mapGif(gif: GiphyApiGif): GiphyResult {
  const img = gif.images.fixed_height;
  return {
    id: gif.id,
    url: img.url,
    previewUrl: gif.images.fixed_height_small.url,
    width: parseInt(img.width) || 200,
    height: parseInt(img.height) || 200,
    title: gif.title,
  };
}

/**
 * Fetch trending stickers from GIPHY.
 */
export async function fetchTrendingStickers(limit = 20): Promise<GiphyResult[]> {
  try {
    const url = `${BASE_URL}/stickers/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GIPHY API error: ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(mapGif);
  } catch (err) {
    logger.error('GIPHY trending fetch failed:', err);
    return [];
  }
}

/**
 * Search stickers on GIPHY.
 */
export async function searchStickers(query: string, limit = 20): Promise<GiphyResult[]> {
  if (!query.trim()) return fetchTrendingStickers(limit);

  try {
    const url = `${BASE_URL}/stickers/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GIPHY API error: ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(mapGif);
  } catch (err) {
    logger.error('GIPHY search failed:', err);
    return [];
  }
}

/**
 * Fetch trending GIFs (not stickers) from GIPHY.
 */
export async function fetchTrendingGifs(limit = 20): Promise<GiphyResult[]> {
  try {
    const url = `${BASE_URL}/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GIPHY API error: ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(mapGif);
  } catch (err) {
    logger.error('GIPHY trending GIFs fetch failed:', err);
    return [];
  }
}

/**
 * Search GIFs on GIPHY.
 */
export async function searchGifs(query: string, limit = 20): Promise<GiphyResult[]> {
  if (!query.trim()) return fetchTrendingGifs(limit);

  try {
    const url = `${BASE_URL}/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GIPHY API error: ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(mapGif);
  } catch (err) {
    logger.error('GIPHY GIF search failed:', err);
    return [];
  }
}

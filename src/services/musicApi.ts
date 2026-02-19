/**
 * Music API service - Gap #8
 * Fetches real music from Pixabay and Jamendo APIs
 * Falls back to mock data if API keys aren't configured
 */

import { logger } from '@/utils/logger';

export interface MusicApiTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  previewUrl: string;
  duration: number;
  genre: string;
  tags: string[];
  source: 'pixabay' | 'jamendo' | 'mock';
  attribution?: string;
  coverUrl?: string;
}

interface PixabayHit {
  id: number;
  title: string;
  user: string;
  audio_url: string;
  duration: number;
  tags: string;
}

interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  audiodownload: string;
  duration: number;
  album_image: string;
}

const PIXABAY_KEY = process.env.NEXT_PUBLIC_PIXABAY_KEY || '';
const JAMENDO_CLIENT_ID = process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID || '';

// Mock fallback data
const MOCK_TRACKS: MusicApiTrack[] = [
  { id: 'mt-1', title: 'Neon Dreams', artist: 'SynthWave', url: '/audio/neon-dreams.mp3', previewUrl: '/audio/neon-dreams.mp3', duration: 185, genre: 'Electronic', tags: ['synth', 'energetic'], source: 'mock' },
  { id: 'mt-2', title: 'Sunset Boulevard', artist: 'ChillHop', url: '/audio/sunset-blvd.mp3', previewUrl: '/audio/sunset-blvd.mp3', duration: 210, genre: 'Chill', tags: ['chill', 'calm'], source: 'mock' },
  { id: 'mt-3', title: 'City Lights', artist: 'Urban Beat', url: '/audio/city-lights.mp3', previewUrl: '/audio/city-lights.mp3', duration: 195, genre: 'Hip Hop', tags: ['hip-hop', 'urban'], source: 'mock' },
  { id: 'mt-4', title: 'Velvet Touch', artist: 'Smooth Jazz Co', url: '/audio/velvet-touch.mp3', previewUrl: '/audio/velvet-touch.mp3', duration: 240, genre: 'Jazz', tags: ['jazz', 'smooth'], source: 'mock' },
  { id: 'mt-5', title: 'Electric Pulse', artist: 'Bass Nation', url: '/audio/electric-pulse.mp3', previewUrl: '/audio/electric-pulse.mp3', duration: 175, genre: 'Electronic', tags: ['bass', 'dance'], source: 'mock' },
  { id: 'mt-6', title: 'Morning Coffee', artist: 'Lofi Beats', url: '/audio/morning-coffee.mp3', previewUrl: '/audio/morning-coffee.mp3', duration: 160, genre: 'Chill', tags: ['lofi', 'morning'], source: 'mock' },
  { id: 'mt-7', title: 'Rainy Day', artist: 'Mellow Piano', url: '/audio/rainy-day.mp3', previewUrl: '/audio/rainy-day.mp3', duration: 220, genre: 'Classical', tags: ['piano', 'sad'], source: 'mock' },
  { id: 'mt-8', title: 'Summer Vibes', artist: 'PopStar', url: '/audio/summer-vibes.mp3', previewUrl: '/audio/summer-vibes.mp3', duration: 198, genre: 'Pop', tags: ['pop', 'happy'], source: 'mock' },
  { id: 'mt-9', title: 'Midnight Rock', artist: 'Guitar Heroes', url: '/audio/midnight-rock.mp3', previewUrl: '/audio/midnight-rock.mp3', duration: 230, genre: 'Rock', tags: ['rock', 'guitar'], source: 'mock' },
  { id: 'mt-10', title: 'Float Away', artist: 'Ambient Sky', url: '/audio/float-away.mp3', previewUrl: '/audio/float-away.mp3', duration: 300, genre: 'Ambient', tags: ['ambient', 'calm'], source: 'mock' },
];

async function searchPixabay(query: string): Promise<MusicApiTrack[]> {
  if (!PIXABAY_KEY) return [];
  try {
    const params = new URLSearchParams({
      key: PIXABAY_KEY,
      q: query,
      per_page: '15',
    });
    const res = await fetch(`https://pixabay.com/api/?${params}&category=music`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hits || []).map((h: PixabayHit) => ({
      id: `px-${h.id}`,
      title: h.title || 'Untitled',
      artist: h.user || 'Pixabay',
      url: h.audio_url,
      previewUrl: h.audio_url,
      duration: h.duration || 0,
      genre: (h.tags || '').split(',')[0]?.trim() || 'Music',
      tags: (h.tags || '').split(',').map((t: string) => t.trim()),
      source: 'pixabay' as const,
      attribution: `Music by ${h.user} from Pixabay`,
    }));
  } catch (err) {
    logger.error('Pixabay search failed:', err);
    return [];
  }
}

async function searchJamendo(query: string): Promise<MusicApiTrack[]> {
  if (!JAMENDO_CLIENT_ID) return [];
  try {
    const params = new URLSearchParams({
      client_id: JAMENDO_CLIENT_ID,
      format: 'json',
      limit: '15',
      namesearch: query,
      include: 'musicinfo',
    });
    const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((t: JamendoTrack) => ({
      id: `jm-${t.id}`,
      title: t.name,
      artist: t.artist_name,
      url: t.audiodownload || t.audio,
      previewUrl: t.audio,
      duration: t.duration || 0,
      genre: 'Music',
      tags: [],
      source: 'jamendo' as const,
      attribution: `"${t.name}" by ${t.artist_name} (Jamendo)`,
      coverUrl: t.album_image,
    }));
  } catch (err) {
    logger.error('Jamendo search failed:', err);
    return [];
  }
}

export const musicApiService = {
  /** Search across all available music sources */
  async search(query: string): Promise<MusicApiTrack[]> {
    if (!PIXABAY_KEY && !JAMENDO_CLIENT_ID) {
      return filterMock(query);
    }
    const [pixabay, jamendo] = await Promise.all([
      searchPixabay(query),
      searchJamendo(query),
    ]);
    const results = [...pixabay, ...jamendo];
    return results.length > 0 ? results : filterMock(query);
  },

  /** Get trending/featured tracks */
  async getTrending(): Promise<MusicApiTrack[]> {
    if (!PIXABAY_KEY && !JAMENDO_CLIENT_ID) {
      return MOCK_TRACKS;
    }
    const [pixabay, jamendo] = await Promise.all([
      searchPixabay('trending'),
      searchJamendo('pop'),
    ]);
    const results = [...pixabay, ...jamendo];
    return results.length > 0 ? results : MOCK_TRACKS;
  },

  /** Check if real APIs are configured */
  hasRealApi(): boolean {
    return !!(PIXABAY_KEY || JAMENDO_CLIENT_ID);
  },
};

function filterMock(query: string): MusicApiTrack[] {
  if (!query.trim()) return MOCK_TRACKS;
  const q = query.toLowerCase();
  return MOCK_TRACKS.filter(
    t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.genre.toLowerCase().includes(q)
  );
}

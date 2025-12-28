'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { feedApi } from '@/services/api';
import { SideNav } from '@/components/ui/SideNav';
import { BottomNav } from '@/components/ui/BottomNav';
import { AuroraContainer, GlassButton, GlassCard, GlassPill, GradientText, SoundVisualizer } from '@/components/ui/Glass';
import type { Video } from '@/types';

// ═══════════════════════════════════════════════════════════
// VIBE DATA
// ═══════════════════════════════════════════════════════════

const VIBES = [
  { id: 'chill', name: 'Chill', emoji: '😌', color: 'from-blue-500 to-purple-500' },
  { id: 'hype', name: 'Hype', emoji: '🔥', color: 'from-orange-500 to-pink-500' },
  { id: 'dark', name: 'Dark', emoji: '🌙', color: 'from-gray-800 to-purple-900' },
  { id: 'funny', name: 'Funny', emoji: '😂', color: 'from-yellow-400 to-orange-500' },
  { id: 'aesthetic', name: 'Aesthetic', emoji: '✨', color: 'from-pink-400 to-purple-400' },
  { id: 'learn', name: 'Learn', emoji: '🧠', color: 'from-green-400 to-teal-500' },
];

const CATEGORIES = [
  'Music', 'Dance', 'Comedy', 'Sports', 'Food', 'Gaming', 'Fashion', 'Art'
];

// Mock data for demo - these will be replaced with real API data
const MOCK_SOUNDS = [
  { id: 's1', name: 'Midnight Drive', artist: 'Synth Wave', uses: 45000, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100' },
  { id: 's2', name: 'Viral Dance', artist: 'BassKing', uses: 128000, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100' },
  { id: 's3', name: 'Chill Lofi', artist: 'StudyBeats', uses: 89000, coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100' },
];

const MOCK_CHALLENGE = {
  id: 'c1',
  title: 'Neon Glow Challenge',
  hashtag: 'NeonGlow',
  participants: 847293,
  reward: '$10,000',
  backgroundUrl: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800',
  endsIn: '2 days',
};

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function DiscoverPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const [activeSound, setActiveSound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadDiscoverContent();
  }, []);

  const loadDiscoverContent = async () => {
    try {
      setIsLoading(true);
      const [videosResponse] = await Promise.all([
        feedApi.getTrendingFeed(1, 12),
      ]);
      setTrendingVideos(videosResponse.items);
    } catch (error) {
      console.error('Failed to load discover content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Get first trending video for hero
  const heroVideo = trendingVideos[0];

  return (
    <AuroraContainer className="flex min-h-screen bg-[#030014]">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-24 md:pb-8 overflow-x-hidden">
        {/* Hero Header */}
        <header className="px-4 md:px-8 pt-6 pb-4">
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            <GradientText animate>Discover</GradientText>
          </h1>
          <p className="text-white/60 text-lg">Find your next obsession</p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, creators, sounds..."
              className="w-full glass rounded-2xl px-12 py-4 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </header>

        {/* Bento Grid */}
        <div className="px-4 md:px-8">
          <div className="bento-grid stagger-children">

            {/* ═══ TRENDING HERO ═══ */}
            <div className="bento-xl glass-card p-0 overflow-hidden group cursor-pointer">
              <Link href={heroVideo ? `/feed?video=${heroVideo.id}` : '/trending'}>
                <div className="relative w-full h-full">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: heroVideo?.thumbnailUrl
                        ? `url(${heroVideo.thumbnailUrl})`
                        : 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <GlassPill color="orange">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
                      </svg>
                      TRENDING
                    </GlassPill>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                      {heroVideo?.caption || 'Discover trending content'}
                    </h2>
                    <div className="flex items-center gap-3">
                      {heroVideo?.userAvatar ? (
                        <img src={heroVideo.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-500" />
                      )}
                      <div>
                        <p className="font-medium">{heroVideo?.username || 'VIB3 Creator'}</p>
                        <p className="text-sm text-white/60">{heroVideo ? formatCount(heroVideo.viewsCount || 0) : '0'} views</p>
                      </div>
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-20 h-20 rounded-full glass-heavy flex items-center justify-center glow-pulse">
                      <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* ═══ LIVE PULSE ═══ */}
            <div className="bento-md glass-card p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <GlassPill color="pink" pulse>
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  LIVE NOW
                </GlassPill>
              </div>

              <Link href="/live" className="flex-1 relative rounded-xl overflow-hidden mb-3 group">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="font-medium text-sm truncate">Live streams happening now</p>
                  <p className="text-xs text-white/60">Tap to explore</p>
                </div>
              </Link>

              <GlassButton size="sm" className="w-full">
                Go Live
              </GlassButton>
            </div>

            {/* ═══ FOR YOU TALL ═══ */}
            <div className="bento-tall glass-card p-4 flex flex-col">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span className="text-purple-400">✦</span>
                For You
              </h3>
              <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                {(isLoading ? Array(3).fill(null) : trendingVideos.slice(1, 4)).map((video, i) => (
                  <Link
                    key={video?.id || i}
                    href={video ? `/feed?video=${video.id}` : '#'}
                    className="block relative aspect-[9/16] rounded-xl overflow-hidden bg-white/5 group"
                  >
                    {video?.thumbnailUrl ? (
                      <>
                        <div
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                          style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs">
                          <span>{formatCount(video.viewsCount || 0)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 animate-pulse bg-white/10" />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* ═══ VIBE SELECTOR ═══ */}
            <div className="bento-wide glass-card p-4">
              <h3 className="text-lg font-bold mb-3 gradient-text">Pick Your Vibe</h3>
              <div className="grid grid-cols-3 gap-2">
                {VIBES.map((vibe) => (
                  <button
                    key={vibe.id}
                    onClick={() => setActiveVibe(vibe.id === activeVibe ? null : vibe.id)}
                    className={`
                      relative rounded-xl p-2 transition-all duration-300
                      flex flex-col items-center justify-center gap-1
                      ${activeVibe === vibe.id
                        ? `bg-gradient-to-br ${vibe.color} scale-105 shadow-lg`
                        : 'bg-white/5 hover:bg-white/10'
                      }
                    `}
                  >
                    <span className="text-xl">{vibe.emoji}</span>
                    <span className="text-xs font-medium">{vibe.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ═══ TRENDING SOUNDS ═══ */}
            <div className="bento-md glass-card p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Trending Sounds</h3>
                <SoundVisualizer isPlaying={isPlaying} />
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                {MOCK_SOUNDS.map((sound, i) => (
                  <button
                    key={sound.id}
                    onClick={() => {
                      setActiveSound(i);
                      setIsPlaying(true);
                    }}
                    className={`
                      w-full flex items-center gap-3 p-2 rounded-xl transition-all
                      ${activeSound === i ? 'bg-white/10' : 'hover:bg-white/5'}
                    `}
                  >
                    <img
                      src={sound.coverUrl}
                      alt={sound.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-sm truncate">{sound.name}</p>
                      <p className="text-xs text-white/60 truncate">{sound.artist}</p>
                    </div>
                    <span className="text-xs text-white/40">{(sound.uses / 1000).toFixed(1)}K</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ═══ CHALLENGE BANNER ═══ */}
            <div className="bento-wide glass-card p-0 overflow-hidden">
              <Link href={`/challenges/${MOCK_CHALLENGE.id}`}>
                <div className="relative w-full h-full">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${MOCK_CHALLENGE.backgroundUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-900/70 to-transparent" />

                  <div className="relative h-full flex items-center justify-between p-4">
                    <div>
                      <GlassPill color="purple" className="mb-2">
                        #{MOCK_CHALLENGE.hashtag}
                      </GlassPill>
                      <h3 className="text-lg font-bold mb-1">{MOCK_CHALLENGE.title}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-white/60">
                          {MOCK_CHALLENGE.participants.toLocaleString()} joined
                        </span>
                        <span className="text-orange-400">Ends {MOCK_CHALLENGE.endsIn}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-white/60 mb-1">Prize</p>
                      <p className="text-xl font-bold gradient-text">{MOCK_CHALLENGE.reward}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* ═══ VIDEO GRID ═══ */}
            {trendingVideos.slice(4, 8).map((video, i) => (
              <div
                key={video.id}
                className={`${i === 0 ? 'bento-md' : 'bento-sm'} glass-card p-0 overflow-hidden group cursor-pointer`}
              >
                <Link href={`/feed?video=${video.id}`}>
                  <div className="relative w-full h-full">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" />
                        </svg>
                        {formatCount(video.viewsCount || 0)}
                      </span>
                    </div>

                    {/* Hover Play */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full glass flex items-center justify-center">
                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {/* ═══ CATEGORIES ═══ */}
            <div className="bento-wide glass-card p-4">
              <h3 className="font-bold mb-3">Quick Categories</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Link key={cat} href={`/category/${cat.toLowerCase()}`}>
                    <GlassButton size="sm" variant="ghost" className="text-sm hover:scale-105 transition-transform">
                      {cat}
                    </GlassButton>
                  </Link>
                ))}
              </div>
            </div>

            {/* ═══ WATCH PARTY PROMO ═══ */}
            <div className="bento-lg glass-card p-0 overflow-hidden group">
              <Link href="/watch-party">
                <div className="relative w-full h-full">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                    style={{
                      backgroundImage: 'url(https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800)',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-900/70 to-teal-900/50" />
                  <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
                    <h3 className="text-2xl font-black mb-2">Watch Party</h3>
                    <p className="text-white/70 mb-4">Watch together with friends in real-time</p>
                    <GlassButton variant="brutal">
                      Start Party
                    </GlassButton>
                  </div>
                </div>
              </Link>
            </div>

            {/* ═══ TIME CAPSULE ═══ */}
            <div className="bento-wide glass-card p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-3xl">⏳</span>
                <h3 className="text-xl font-bold">Time Capsules</h3>
              </div>
              <p className="text-white/60 mb-4">Save moments that unlock on a special date</p>
              <Link href="/capsule/create">
                <GlassButton variant="glass" glow>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Capsule
                </GlassButton>
              </Link>
            </div>

          </div>
        </div>

        {/* Floating Create Button */}
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-40">
          <Link href="/upload">
            <GlassButton variant="brutal" size="lg" className="shadow-2xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              CREATE
            </GlassButton>
          </Link>
        </div>
      </main>

      <BottomNav />
    </AuroraContainer>
  );
}

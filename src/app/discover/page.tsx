'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { feedApi, soundsApi, challengesApi } from '@/services/api';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraContainer, GlassButton } from '@/components/ui/Glass';
import {
  DiscoverHeader,
  TrendingHeroCard,
  LivePulseCard,
  ForYouSection,
  VibeSelector,
  TrendingSoundsCard,
  ChallengeBanner,
  VideoGridItem,
  CategoriesSection,
  WatchPartyCard,
  TimeCapsuleCard,
} from '@/components/discover';
import type { Video } from '@/types';
import type { Challenge } from '@/types/challenge';
import type { MusicTrack } from '@/types/sound';

export default function DiscoverPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [trendingSounds, setTrendingSounds] = useState<MusicTrack[]>([]);
  const [featuredChallenge, setFeaturedChallenge] = useState<Challenge | null>(null);
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
      const [videosResponse, soundsResponse, challengesResponse] = await Promise.all([
        feedApi.getTrendingFeed(1, 12),
        soundsApi.getTrending(1, 5),
        challengesApi.getFeaturedChallenges().catch(() => []),
      ]);
      setTrendingVideos(videosResponse.items);
      setTrendingSounds(soundsResponse.data || []);
      if (challengesResponse.length > 0) {
        setFeaturedChallenge(challengesResponse[0]);
      }
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

  const handleSoundSelect = (index: number) => {
    setActiveSound(index);
    setIsPlaying(true);
  };

  return (
    <AuroraContainer className="min-h-screen bg-[#030014]">
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 overflow-x-hidden">
        <DiscoverHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
        />

        <div className="px-4 md:px-8">
          <div className="bento-grid stagger-children">
            <TrendingHeroCard video={trendingVideos[0]} />
            <LivePulseCard />
            <ForYouSection videos={trendingVideos} isLoading={isLoading} />
            <VibeSelector activeVibe={activeVibe} onVibeChange={setActiveVibe} />
            <TrendingSoundsCard
              sounds={trendingSounds}
              activeSound={activeSound}
              isPlaying={isPlaying}
              onSoundSelect={handleSoundSelect}
            />
            <ChallengeBanner challenge={featuredChallenge} />

            {trendingVideos.slice(4, 8).map((video, i) => (
              <VideoGridItem key={video.id} video={video} size={i === 0 ? 'md' : 'sm'} />
            ))}

            <CategoriesSection />
            <WatchPartyCard />
            <TimeCapsuleCard />
          </div>
        </div>

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
    </AuroraContainer>
  );
}

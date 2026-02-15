'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { feedApi } from '@/services/api';
import { soundsApi } from '@/services/api/sounds';
import { TopNav } from '@/components/ui/TopNav';
import type { Video } from '@/types';
import type { MusicTrack } from '@/types/sound';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

interface TrendingHashtag {
  tag: string;
  videoCount: number;
  viewCount: number;
}

export default function TrendingPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
  const [sounds, setSounds] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [soundsLoading, setSoundsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'hashtags' | 'sounds'>('videos');

  useEffect(() => {
    let cancelled = false;
    const loadTrending = async () => {
      try {
        setIsLoading(true);
        const response = await feedApi.getTrendingFeed(1, 24);
        if (cancelled) return;
        setVideos(response.items);

        // Extract trending hashtags from videos
        const tagCounts: Record<string, { count: number; views: number }> = {};
        response.items.forEach(video => {
          video.hashtags?.forEach(tag => {
            if (!tagCounts[tag]) {
              tagCounts[tag] = { count: 0, views: 0 };
            }
            tagCounts[tag].count++;
            tagCounts[tag].views += video.viewsCount || 0;
          });
        });

        const sortedTags = Object.entries(tagCounts)
          .map(([tag, data]) => ({
            tag,
            videoCount: data.count,
            viewCount: data.views,
          }))
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 20);

        if (!cancelled) {
          setHashtags(sortedTags);
        }
      } catch (error) {
        console.error('Failed to load trending:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    loadTrending();
    return () => { cancelled = true; };
  }, []);

  const loadSounds = useCallback(async () => {
    if (sounds.length > 0) return;
    setSoundsLoading(true);
    const result = await soundsApi.getTrending(1, 20);
    setSounds(result.data);
    setSoundsLoading(false);
  }, [sounds.length]);

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-heavy mx-4 mt-3 rounded-2xl">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                Trending
              </h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-2">
            {[
              { id: 'videos', label: 'Videos' },
              { id: 'hashtags', label: 'Hashtags' },
              { id: 'sounds', label: 'Sounds' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'glass-heavy text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[9/16] glass rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {videos.map((video, index) => (
                    <Link
                      key={video.id}
                      href={`/feed?video=${video.id}`}
                      className="relative aspect-[9/16] glass-card rounded-lg overflow-hidden group"
                    >
                      {video.thumbnailUrl ? (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.caption || 'Video'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          </svg>
                        </div>
                      )}

                      {/* Rank Badge */}
                      {index < 3 && (
                        <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          'bg-amber-600'
                        }`}>
                          {index + 1}
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        <span>{formatCount(video.viewsCount || 0)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Hashtags Tab */}
              {activeTab === 'hashtags' && (
                <div className="space-y-3">
                  {hashtags.map((hashtag, index) => (
                    <Link
                      key={hashtag.tag}
                      href={`/hashtag/${hashtag.tag}`}
                      className="flex items-center gap-4 p-4 glass-card hover:bg-white/10 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        index < 3 ? 'bg-gradient-to-br from-purple-500 to-teal-400' : 'bg-white/10'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">#{hashtag.tag}</h3>
                        <p className="text-white/50 text-sm">
                          {formatCount(hashtag.viewCount)} views
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-white/70 text-sm">{hashtag.videoCount} videos</div>
                      </div>
                    </Link>
                  ))}

                  {hashtags.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-white/50">No trending hashtags yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Sounds Tab */}
              {activeTab === 'sounds' && (
                <SoundsTab sounds={sounds} loading={soundsLoading} onLoad={loadSounds} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function SoundsTab({ sounds, loading, onLoad }: { sounds: MusicTrack[]; loading: boolean; onLoad: () => void }) {
  useEffect(() => { onLoad(); }, [onLoad]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 glass rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (sounds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50">No trending sounds yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sounds.map((track, index) => (
        <div key={track.id || track._id} className="flex items-center gap-4 p-4 glass-card hover:bg-white/10 transition-colors rounded-xl">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
            index < 3 ? 'bg-gradient-to-br from-purple-500 to-teal-400' : 'bg-white/10'
          }`}>
            {index + 1}
          </div>
          {track.coverUrl ? (
            <Image src={track.coverUrl} alt={track.title} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate">{track.title}</h3>
            <p className="text-white/50 text-sm truncate">{track.artist}</p>
          </div>
          <div className="text-right">
            {track.plays > 0 && <div className="text-white/70 text-sm">{formatCount(track.plays)} uses</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { feedApi } from '@/services/api';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';
import type { Video } from '@/types';

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
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'hashtags' | 'sounds'>('videos');

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      setIsLoading(true);
      const response = await feedApi.getTrendingFeed(1, 24);
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

      setHashtags(sortedTags);
    } catch (error) {
      console.error('Failed to load trending:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0A0E1A]">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              Trending
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {[
              { id: 'videos', label: 'Videos' },
              { id: 'hashtags', label: 'Hashtags' },
              { id: 'sounds', label: 'Sounds' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-3 text-sm font-medium relative ${
                  activeTab === tab.id ? 'text-white' : 'text-white/50'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#14B8A6]" />
                )}
              </button>
            ))}
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[9/16] bg-[#1A1F2E] rounded-lg animate-pulse" />
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
                      className="relative aspect-[9/16] bg-[#1A1F2E] rounded-lg overflow-hidden group"
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
                      className="flex items-center gap-4 p-4 bg-[#1A1F2E] rounded-xl hover:bg-[#252A3E] transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        index < 3 ? 'bg-gradient-to-br from-[#6366F1] to-[#14B8A6]' : 'bg-white/10'
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
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <p className="text-white/50">Trending sounds coming soon</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

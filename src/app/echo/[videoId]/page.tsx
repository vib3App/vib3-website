'use client';

import Image from 'next/image';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopNav } from '@/components/ui/TopNav';
import { BottomNav } from '@/components/ui/BottomNav';
import { echoApi, type Echo } from '@/services/api/echo';
import { videoApi } from '@/services/api/video';
import type { Video } from '@/types';
import { logger } from '@/utils/logger';

export default function EchoPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = use(params);
  const router = useRouter();
  const [originalVideo, setOriginalVideo] = useState<Video | null>(null);
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [videoData, echoData] = await Promise.all([
          videoApi.getVideo(videoId),
          echoApi.getEchoes(videoId),
        ]);
        if (!cancelled) {
          setOriginalVideo(videoData);
          setEchoes(echoData.echoes);
        }
      } catch (error) {
        logger.error('Failed to load data:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [videoId]);

  const handleCreateEcho = () => {
    // Store the original video ID for the camera/upload flow
    sessionStorage.setItem('echoOriginalVideoId', videoId);
    router.push('/camera?mode=echo');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen aurora-bg pb-20">
        <TopNav />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <TopNav />

      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-white mb-4">Echo Responses</h1>

        {/* Original Video */}
        {originalVideo && (
          <div className="mb-6">
            <h2 className="text-sm text-white/50 mb-2">Original Video</h2>
            <Link
              href={`/video/${originalVideo.id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-16 h-24 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 relative">
                {originalVideo.thumbnailUrl ? (
                  <Image
                    src={originalVideo.thumbnailUrl}
                    alt={(originalVideo.caption || "Video") + " thumbnail"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {originalVideo.caption || 'Video'}
                </p>
                <p className="text-white/50 text-sm">@{originalVideo.username}</p>
              </div>
            </Link>
          </div>
        )}

        {/* Create Echo Button */}
        <button
          onClick={handleCreateEcho}
          className="w-full py-3 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Create Echo Response
        </button>

        {/* Echoes List */}
        <h2 className="text-lg font-semibold text-white mb-3">
          Responses
          {echoes.length > 0 && (
            <span className="text-white/40 font-normal ml-2">{echoes.length}</span>
          )}
        </h2>

        {echoes.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {echoes.map((echo) => (
              <Link
                key={echo.id}
                href={`/video/${echo.responseVideoId}`}
                className="aspect-[9/16] rounded-lg overflow-hidden bg-white/5 relative group"
              >
                {echo.responseVideo?.thumbnailUrl ? (
                  <Image
                    src={echo.responseVideo.thumbnailUrl}
                    alt={"Echo response by @" + (echo.responseVideo?.username || "user")}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-1 left-1 right-1">
                  <p className="text-white text-xs truncate">
                    @{echo.responseVideo?.username}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🎙️</span>
            <p className="text-white/50 mb-2">No echo responses yet</p>
            <p className="text-white/30 text-sm">Be the first to respond!</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

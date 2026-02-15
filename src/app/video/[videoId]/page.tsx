'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { FeedVideoItem } from '@/components/feed';
import { CommentSheet } from '@/components/video/CommentSheet';
import { ShareSheet } from '@/components/video/ShareSheet';
import { useAuthStore } from '@/stores/authStore';
import { videoApi, userApi } from '@/services/api';
import type { Video } from '@/types';

export default function VideoPlayerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen aurora-bg flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" /></div>}>
      <VideoPlayerContent />
    </Suspense>
  );
}

function VideoPlayerContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = params.videoId as string;
  const userId = searchParams.get('user'); // Get userId from query param

  const { isAuthenticated, user } = useAuthStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load the initial video and user's other videos
  useEffect(() => {
    async function loadVideos() {
      setIsLoading(true);
      setError(null);

      try {
        let targetVideo: Video | null = null;
        let allVideos: Video[] = [];

        // If we have a userId, load all their videos and find the target
        if (userId) {
          const userVideosResponse = await userApi.getUserVideos(userId);
          const userVideos = userVideosResponse.videos || [];

          // Find the target video
          targetVideo = userVideos.find(v => v.id === videoId) || null;

          if (targetVideo) {
            // Put target video first, then others
            const otherVideos = userVideos.filter(v => v.id !== videoId);
            allVideos = [targetVideo, ...otherVideos];
          } else {
            // Video not found in user's videos - just show all
            allVideos = userVideos;
          }
        } else {
          // No userId - try to fetch single video via API
          try {
            targetVideo = await videoApi.getVideo(videoId);
            if (targetVideo) {
              allVideos = [targetVideo];

              // Try to load more from the same user
              try {
                const userVideosResponse = await userApi.getUserVideos(targetVideo.userId);
                const otherVideos = (userVideosResponse.videos || []).filter(v => v.id !== videoId);
                allVideos = [targetVideo, ...otherVideos];
              } catch {
                // Just show single video if user videos fail
              }
            }
          } catch (apiErr) {
            console.error('Failed to fetch video:', apiErr);
            throw new Error('Could not load video. Try again.');
          }
        }

        if (allVideos.length === 0) {
          throw new Error('No videos found');
        }

        setVideos(allVideos);
        setCurrentIndex(0);
      } catch (err: unknown) {
        console.error('Failed to load video:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load video';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    if (videoId) {
      loadVideos();
    }
  }, [videoId, userId]);

  // Scroll-based detection for current video (more reliable with snap scrolling)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      // Calculate which video is most visible
      const newIndex = Math.round(scrollTop / containerHeight);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
        setCurrentIndex(newIndex);
      }
    };

    // Also use scroll end detection for snap scrolling
    let scrollTimeout: NodeJS.Timeout;
    const handleScrollEnd = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        handleScroll();
      }, 50);
    };

    container.addEventListener('scroll', handleScrollEnd, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScrollEnd);
      clearTimeout(scrollTimeout);
    };
  }, [currentIndex, videos.length]);

  const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);

  const handleLike = useCallback(async (index: number) => {
    if (!isAuthenticated) return;
    const video = videos[index];
    try {
      const result = await videoApi.toggleLike(video.id);
      setVideos(prev => prev.map((v, i) =>
        i === index ? { ...v, isLiked: result.liked, likesCount: result.likesCount } : v
      ));
    } catch (err) {
      console.error('Failed to like:', err);
    }
  }, [videos, isAuthenticated]);

  const handleSave = useCallback(async (index: number) => {
    if (!isAuthenticated) return;
    const video = videos[index];
    try {
      const result = await videoApi.toggleFavorite(video.id);
      setVideos(prev => prev.map((v, i) =>
        i === index ? { ...v, isFavorited: result.favorited } : v
      ));
    } catch (err) {
      console.error('Failed to save:', err);
    }
  }, [videos, isAuthenticated]);

  const handleFollow = useCallback(async (_index: number) => {
    // Follow logic - would need user API
    // TODO: Wire follow API
  }, []);

  const handleComment = useCallback((_id: string) => {
    setCommentsOpen(true);
  }, []);

  const handleShare = useCallback((_id: string) => {
    setShareOpen(true);
  }, []);

  const selectedVideo = videos[currentIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error || videos.length === 0) {
    return (
      <div className="min-h-screen aurora-bg flex flex-col items-center justify-center px-4">
        <div className="text-white/50 text-lg mb-4">{error || 'Video not found'}</div>
        <button onClick={() => router.back()} className="text-purple-400 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      {/* Back button and creator info - top right, below header */}
      <div className="fixed top-[4.5rem] md:top-[3.75rem] right-4 z-50 flex items-center gap-2">
        {selectedVideo && (
          <div className="glass-card px-3 py-2 rounded-full flex items-center gap-2">
            <Link href={`/profile/${selectedVideo.userId}`} className="text-white font-medium hover:underline">
              @{selectedVideo.username}
            </Link>
            <span className="text-white/50 text-sm">•</span>
            <span className="text-white/50 text-sm">{videos.length} videos</span>
          </div>
        )}
        <button
          onClick={() => router.back()}
          className="glass-card p-2 rounded-full text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <main className="h-full pt-16 relative z-10">
        <div
          ref={scrollContainerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {videos.map((video, index) => (
            <div key={`${video.id}-${index}`} data-index={index} className="h-full w-full snap-start snap-always flex-shrink-0" style={{ minHeight: '100%' }}>
              <FeedVideoItem
                video={video}
                isActive={index === currentIndex}
                isMuted={isMuted}
                onMuteToggle={toggleMute}
                onLike={() => handleLike(index)}
                onSave={() => handleSave(index)}
                onFollow={() => handleFollow(index)}
                onComment={() => handleComment(video.id)}
                onShare={() => handleShare(video.id)}
                userId={user?.id}
              />
            </div>
          ))}
        </div>
      </main>

      {selectedVideo && (
        <>
          <CommentSheet
            videoId={selectedVideo.id}
            isOpen={commentsOpen}
            onClose={() => setCommentsOpen(false)}
          />
          <ShareSheet
            videoId={selectedVideo.id}
            videoUrl={selectedVideo.videoUrl}
            isOpen={shareOpen}
            onClose={() => setShareOpen(false)}
          />
        </>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

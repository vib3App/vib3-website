'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { FeedVideoItem } from '@/components/feed';
import { CommentSheet } from '@/components/video/CommentSheet';
import { ShareSheet } from '@/components/video/ShareSheet';
import { useAuthStore } from '@/stores/authStore';
import { videoApi, feedApi } from '@/services/api';
import type { Video } from '@/types';

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;

  const { isAuthenticated, user } = useAuthStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load the initial video and user's other videos
  useEffect(() => {
    async function loadVideos() {
      setIsLoading(true);
      setError(null);

      try {
        // First, get the clicked video
        const video = await videoApi.getVideo(videoId);

        // Then get more videos from the same user
        const userVideosResponse = await feedApi.getUserVideos(video.userId);

        // Find the clicked video in user's videos and put it first
        const otherVideos = userVideosResponse.items.filter(v => v.id !== videoId);
        const allVideos = [video, ...otherVideos];

        setVideos(allVideos);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Failed to load video:', err);
        setError('Failed to load video');
      } finally {
        setIsLoading(false);
      }
    }

    if (videoId) {
      loadVideos();
    }
  }, [videoId]);

  // Intersection observer for detecting current video
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setCurrentIndex(index);
            }
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // Observe video elements
  useEffect(() => {
    const container = scrollContainerRef.current;
    const observer = observerRef.current;
    if (!container || !observer) return;

    const videoElements = container.querySelectorAll('[data-index]');
    videoElements.forEach((el) => observer.observe(el));

    return () => videoElements.forEach((el) => observer.unobserve(el));
  }, [videos]);

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

  const handleFollow = useCallback(async (index: number) => {
    // Follow logic - would need user API
    console.log('Follow user for video:', index);
  }, []);

  const handleComment = useCallback((id: string) => {
    setCommentsOpen(true);
  }, []);

  const handleShare = useCallback((id: string) => {
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

      {/* Back button overlay */}
      <button
        onClick={() => router.back()}
        className="fixed top-20 left-4 z-40 glass-card p-2 rounded-full text-white hover:bg-white/10 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Creator info overlay */}
      {selectedVideo && (
        <div className="fixed top-20 left-16 z-40 glass-card px-3 py-2 rounded-full flex items-center gap-2">
          <Link href={`/profile/${selectedVideo.userId}`} className="text-white font-medium hover:underline">
            @{selectedVideo.username}
          </Link>
          <span className="text-white/50 text-sm">•</span>
          <span className="text-white/50 text-sm">{videos.length} videos</span>
        </div>
      )}

      <main className="h-full pt-16 relative z-10">
        <div
          ref={scrollContainerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {videos.map((video, index) => (
            <div key={`${video.id}-${index}`} data-index={index} className="h-full w-full">
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

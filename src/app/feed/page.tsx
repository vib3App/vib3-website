'use client';

import { Suspense, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { CommentSheet } from '@/components/video/CommentSheet';
import { ShareSheet } from '@/components/video/ShareSheet';
import { useAuthStore } from '@/stores/authStore';
import { useFeed } from '@/hooks/useFeed';
import { useFeedActions } from '@/hooks/useFeedActions';
import { useFeedNavigation } from '@/hooks/useFeedNavigation';
import {
  FeedVideoItem,
  FeedQueuePanel,
  FeedTopActions,
  FeedEmptyState,
  FeedLoadingState,
  FeedLoadingMore,
  FollowCategoryPicker,
  SwipeActions,
} from '@/components/feed';
import { BottomNav } from '@/components/ui/BottomNav';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { userApi } from '@/services/api';
import { logger } from '@/utils/logger';

/** Number of items to render above and below the current index */
const VIRTUAL_WINDOW = 2;

function FeedContent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const {
    activeTab,
    videos,
    setVideos,
    currentIndex,
    isLoading,
    loadingMore,
    scrollContainerRef,
    scrollToVideo,
  } = useFeed();
  const {
    isMuted,
    showQueue,
    commentsOpen,
    shareOpen,
    selectedVideo,
    handleLike,
    handleSave,
    handleFollow,
    handleRepost,
    handleComment,
    handleCommentAdded,
    handleShare,
    handleShareComplete,
    toggleMute,
    toggleQueue,
    closeQueue,
    closeComments,
    closeShare,
  } = useFeedActions({
    videos,
    setVideos,
    isAuthenticated,
  });

  // Follow category picker state
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [pickerUser, setPickerUser] = useState<{ id: string; username: string; avatar?: string } | null>(null);

  // Show category picker after successful follow
  const _handleFollowWithPicker = (userId: string, username: string, avatar?: string) => {
    setPickerUser({ id: userId, username, avatar });
    setShowCategoryPicker(true);
  };

  useFeedNavigation({
    currentIndex,
    videos,
    scrollToVideo,
    onLike: handleLike,
    onComment: handleComment,
    onShare: handleShare,
    toggleMute,
    disabled: commentsOpen || shareOpen,
  });

  // Swipe action handlers
  const handleNotInterested = useCallback(
    (index: number) => {
      // Remove video from feed (skip it)
      setVideos((prev) => prev.filter((_, i) => i !== index));
    },
    [setVideos]
  );

  const handleReport = useCallback(
    (videoId: string) => {
      router.push(`/settings/report-problem?videoId=${videoId}`);
    },
    [router]
  );

  const handleHideCreator = useCallback(
    async (userId: string) => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      try {
        await userApi.blockUser(userId);
        // Remove all videos from this creator
        setVideos((prev) => prev.filter((v) => v.userId !== userId));
      } catch (err) {
        logger.error('Failed to hide creator:', err);
      }
    },
    [isAuthenticated, router, setVideos]
  );

  // Virtual scrolling: compute which indices to render
  const renderWindow = useMemo(() => {
    if (videos.length === 0) return { start: 0, end: 0 };
    const start = Math.max(0, currentIndex - VIRTUAL_WINDOW);
    const end = Math.min(videos.length, currentIndex + VIRTUAL_WINDOW + 1);
    return { start, end };
  }, [currentIndex, videos.length]);

  return (
    <>
      <FeedTopActions
        showQueue={showQueue}
        onToggleQueue={toggleQueue}
      />

      <FeedQueuePanel
        videos={videos}
        currentIndex={currentIndex}
        isOpen={showQueue}
        onClose={closeQueue}
        onScrollToVideo={scrollToVideo}
      />

      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {isLoading && videos.length === 0 ? (
          <FeedLoadingState />
        ) : videos.length === 0 ? (
          <FeedEmptyState activeTab={activeTab} />
        ) : (
          <>
            {videos.map((video, index) => {
              const isInWindow =
                index >= renderWindow.start && index < renderWindow.end;

              return (
                <div
                  key={`${video.id}-${index}`}
                  data-index={index}
                  className="h-full w-full"
                >
                  {isInWindow ? (
                    <SwipeActions
                      onNotInterested={() => handleNotInterested(index)}
                      onReport={() => handleReport(video.id)}
                      onHideCreator={() => handleHideCreator(video.userId)}
                    >
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
                        onRepost={() => handleRepost(index)}
                        userId={user?.id}
                      />
                    </SwipeActions>
                  ) : (
                    <VirtualPlaceholder />
                  )}
                </div>
              );
            })}
            {loadingMore && <FeedLoadingMore />}
          </>
        )}
      </div>

      {selectedVideo && (
        <>
          <CommentSheet
            videoId={selectedVideo.id}
            isOpen={commentsOpen}
            onClose={closeComments}
            onCommentAdded={() => handleCommentAdded(selectedVideo!.id)}
          />
          <ShareSheet
            videoId={selectedVideo.id}
            videoUrl={selectedVideo.videoUrl}
            isOpen={shareOpen}
            onClose={closeShare}
            onShareComplete={() => handleShareComplete(selectedVideo!.id)}
          />
        </>
      )}

      {/* Follow category picker */}
      {pickerUser && (
        <FollowCategoryPicker
          isOpen={showCategoryPicker}
          onClose={() => {
            setShowCategoryPicker(false);
            setPickerUser(null);
          }}
          followedUserId={pickerUser.id}
          followedUsername={pickerUser.username}
          followedAvatar={pickerUser.avatar}
        />
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}

/** Lightweight placeholder for off-screen video items during virtual scrolling */
function VirtualPlaceholder() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="h-screen overflow-hidden relative">
      {/* Aurora background for visual distinction */}
      <AuroraBackground intensity={20} />

      {/* Top Navigation with Dropdowns */}
      <TopNav />

      {/* Full-width video feed - no sidebar */}
      <main className="h-full pt-16 md:pt-16 relative z-10">
        <ErrorBoundary>
          <Suspense fallback={<FeedLoadingState message="Loading..." />}>
            <FeedContent />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Bottom Navigation - mobile */}
      <BottomNav />

      {/* First-time user onboarding */}
      <OnboardingModal />
    </div>
  );
}

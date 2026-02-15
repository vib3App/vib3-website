'use client';

import { Suspense, useState } from 'react';
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
} from '@/components/feed';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

function FeedContent() {
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
    </div>
  );
}

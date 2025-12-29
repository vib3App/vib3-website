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
  CategoryDropdown,
  FollowCategoryPicker,
} from '@/components/feed';

function FeedContent() {
  const { isAuthenticated, user } = useAuthStore();
  const feed = useFeed();
  const actions = useFeedActions({
    videos: feed.videos,
    setVideos: feed.setVideos,
    isAuthenticated,
  });

  // Follow category picker state
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [pickerUser, setPickerUser] = useState<{ id: string; username: string; avatar?: string } | null>(null);

  // Show category picker after successful follow
  const handleFollowWithPicker = (userId: string, username: string, avatar?: string) => {
    setPickerUser({ id: userId, username, avatar });
    setShowCategoryPicker(true);
  };

  useFeedNavigation({
    currentIndex: feed.currentIndex,
    videos: feed.videos,
    scrollToVideo: feed.scrollToVideo,
    onLike: actions.handleLike,
    onComment: actions.handleComment,
    onShare: actions.handleShare,
    toggleMute: actions.toggleMute,
    disabled: actions.commentsOpen || actions.shareOpen,
  });

  return (
    <>
      {/* Category dropdown - top left */}
      <div className="fixed top-20 md:top-[4.5rem] left-4 z-40">
        <CategoryDropdown />
      </div>

      <FeedTopActions
        showQueue={actions.showQueue}
        onToggleQueue={actions.toggleQueue}
      />

      <FeedQueuePanel
        videos={feed.videos}
        currentIndex={feed.currentIndex}
        isOpen={actions.showQueue}
        onClose={actions.closeQueue}
        onScrollToVideo={feed.scrollToVideo}
      />

      <div
        ref={feed.scrollContainerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {feed.isLoading && feed.videos.length === 0 ? (
          <FeedLoadingState />
        ) : feed.videos.length === 0 ? (
          <FeedEmptyState activeTab={feed.activeTab} />
        ) : (
          <>
            {feed.videos.map((video, index) => (
              <div key={`${video.id}-${index}`} data-index={index} className="h-full w-full">
                <FeedVideoItem
                  video={video}
                  isActive={index === feed.currentIndex}
                  isMuted={actions.isMuted}
                  onMuteToggle={actions.toggleMute}
                  onLike={() => actions.handleLike(index)}
                  onSave={() => actions.handleSave(index)}
                  onFollow={() => actions.handleFollow(index)}
                  onComment={() => actions.handleComment(video.id)}
                  onShare={() => actions.handleShare(video.id)}
                  userId={user?.id}
                />
              </div>
            ))}
            {feed.loadingMore && <FeedLoadingMore />}
          </>
        )}
      </div>

      {actions.selectedVideo && (
        <>
          <CommentSheet
            videoId={actions.selectedVideo.id}
            isOpen={actions.commentsOpen}
            onClose={actions.closeComments}
          />
          <ShareSheet
            videoId={actions.selectedVideo.id}
            videoUrl={actions.selectedVideo.videoUrl}
            isOpen={actions.shareOpen}
            onClose={actions.closeShare}
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
        <Suspense fallback={<FeedLoadingState message="Loading..." />}>
          <FeedContent />
        </Suspense>
      </main>
    </div>
  );
}

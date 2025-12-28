'use client';

import { Suspense } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';
import { CommentSheet } from '@/components/video/CommentSheet';
import { ShareSheet } from '@/components/video/ShareSheet';
import { useAuthStore } from '@/stores/authStore';
import { useFeed } from '@/hooks/useFeed';
import { useFeedActions } from '@/hooks/useFeedActions';
import { useFeedNavigation } from '@/hooks/useFeedNavigation';
import {
  FeedVideoItem,
  FeedHeader,
  FeedQueuePanel,
  FeedTopActions,
  FeedEmptyState,
  FeedLoadingState,
  FeedLoadingMore,
} from '@/components/feed';

function FeedContent() {
  const { isAuthenticated, user } = useAuthStore();
  const feed = useFeed();
  const actions = useFeedActions({
    videos: feed.videos,
    setVideos: feed.setVideos,
    isAuthenticated,
  });

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
      <FeedHeader
        activeTab={feed.activeTab}
        selectedVibe={feed.selectedVibe}
        showVibes={feed.showVibes}
        onTabChange={feed.setActiveTab}
        onVibeChange={feed.setSelectedVibe}
        onToggleVibes={() => feed.setShowVibes(!feed.showVibes)}
      />

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

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}

export default function FeedPage() {
  return (
    <div className="flex h-screen bg-[#0A0E1A] overflow-hidden">
      <SideNav />
      <main className="flex-1 md:ml-64 h-full relative">
        <Suspense fallback={<FeedLoadingState message="Loading..." />}>
          <FeedContent />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}

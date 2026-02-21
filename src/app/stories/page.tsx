'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { StoryAvatar } from '@/components/stories/StoryAvatar';
import { StoryViewer } from '@/components/stories/StoryViewer';
import { useStories } from '@/hooks/useStories';
import { useAuthStore } from '@/stores/authStore';
import { storiesApi } from '@/services/api/stories';
import { logger } from '@/utils/logger';

export default function StoriesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAuthVerified } = useAuthStore();
  const { storyGroups, isLoading, markViewed, reactToStory } = useStories();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState(0);

  const handleOpenStory = (index: number) => {
    setViewerGroupIndex(index);
    setViewerOpen(true);
  };

  const handleReply = useCallback(async (storyId: string, message: string) => {
    try {
      await storiesApi.replyToStory(storyId, message);
    } catch (err) {
      logger.error('Failed to reply to story:', err);
    }
  }, []);

  const handleDMReply = useCallback((userId: string, storyContext: string) => {
    setViewerOpen(false);
    router.push(`/messages?user=${userId}&context=${encodeURIComponent(storyContext)}`);
  }, [router]);

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=/stories');
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10 max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Stories</h1>
          <button
            onClick={() => router.push('/stories/create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full text-white text-sm font-medium hover:from-purple-600 hover:to-teal-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : storyGroups.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <p className="text-white/50 text-lg">No stories yet</p>
            <p className="text-white/30 text-sm mt-1">Follow people to see their stories here</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {/* Your story */}
            <div className="flex flex-col items-center">
              <StoryAvatar
                username={user?.username || 'You'}
                avatar={user?.profilePicture}
                hasUnviewed={false}
                isOwn
                onClick={() => router.push('/stories/create')}
              />
            </div>

            {/* Other users' stories */}
            {storyGroups.map((group, index) => (
              <div key={group.userId} className="flex flex-col items-center">
                <StoryAvatar
                  username={group.username}
                  avatar={group.userAvatar}
                  hasUnviewed={group.hasUnviewed}
                  onClick={() => handleOpenStory(index)}
                />
                <span className="text-white/40 text-[10px] mt-1">
                  {group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {viewerOpen && (
        <StoryViewer
          storyGroups={storyGroups}
          initialGroupIndex={viewerGroupIndex}
          onMarkViewed={markViewed}
          onReact={reactToStory}
          onReply={handleReply}
          onDMReply={handleDMReply}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}

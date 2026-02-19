'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StoryAvatar } from './StoryAvatar';
import { StoryViewer } from './StoryViewer';
import { useStories } from '@/hooks/useStories';
import { useAuthStore } from '@/stores/authStore';
import { storiesApi } from '@/services/api/stories';
import { logger } from '@/utils/logger';

export function StoriesRow() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { storyGroups, markViewed, reactToStory } = useStories();
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

  if (storyGroups.length === 0) return null;

  return (
    <>
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        <StoryAvatar
          username={user?.username || 'You'}
          avatar={user?.profilePicture}
          hasUnviewed={false}
          isOwn
          onClick={() => router.push('/stories/create')}
        />
        {storyGroups.map((group, index) => (
          <StoryAvatar
            key={group.userId}
            username={group.username}
            avatar={group.userAvatar}
            hasUnviewed={group.hasUnviewed}
            onClick={() => handleOpenStory(index)}
          />
        ))}
      </div>

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
    </>
  );
}

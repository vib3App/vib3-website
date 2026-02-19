'use client';

import { useState, useCallback, useEffect } from 'react';
import { storiesApi } from '@/services/api/stories';
import { useAuthStore } from '@/stores/authStore';
import type { StoryGroup } from '@/types/story';
import { logger } from '@/utils/logger';

export function useStories() {
  const { isAuthenticated } = useAuthStore();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStories = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const groups = await storiesApi.getStoryFeed();
      setStoryGroups(groups);
    } catch (err) {
      logger.error('Failed to load stories:', err);
      setError('Failed to load stories');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const markViewed = useCallback(async (storyId: string) => {
    try {
      await storiesApi.markViewed(storyId);
      setStoryGroups(prev =>
        prev.map(group => ({
          ...group,
          stories: group.stories.map(s =>
            s.id === storyId ? { ...s, isViewed: true } : s
          ),
          hasUnviewed: group.stories.some(s => s.id !== storyId && !s.isViewed),
        }))
      );
    } catch (err) {
      logger.error('Failed to mark story viewed:', err);
    }
  }, []);

  const reactToStory = useCallback(async (storyId: string, emoji: string) => {
    try {
      const reaction = await storiesApi.reactToStory(storyId, emoji);
      setStoryGroups(prev =>
        prev.map(group => ({
          ...group,
          stories: group.stories.map(s =>
            s.id === storyId
              ? { ...s, reactions: [...s.reactions, reaction] }
              : s
          ),
        }))
      );
    } catch (err) {
      logger.error('Failed to react to story:', err);
    }
  }, []);

  const deleteStory = useCallback(async (storyId: string) => {
    try {
      await storiesApi.deleteStory(storyId);
      setStoryGroups(prev =>
        prev.map(group => ({
          ...group,
          stories: group.stories.filter(s => s.id !== storyId),
        })).filter(group => group.stories.length > 0)
      );
    } catch (err) {
      logger.error('Failed to delete story:', err);
    }
  }, []);

  return {
    storyGroups,
    isLoading,
    error,
    loadStories,
    markViewed,
    reactToStory,
    deleteStory,
  };
}

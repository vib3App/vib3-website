import { apiClient } from '@/services/api/client';
import type { StoryGroup, Story, StoryReaction, StoryViewerProfile } from '@/types/story';
import { logger } from '@/utils/logger';

export const storiesApi = {
  async getStoryFeed(): Promise<StoryGroup[]> {
    try {
      const { data } = await apiClient.get('/stories/feed');
      return data.storyGroups || data || [];
    } catch (err) {
      logger.error('Failed to fetch story feed:', err);
      return [];
    }
  },

  async getUserStories(userId: string): Promise<Story[]> {
    try {
      const { data } = await apiClient.get(`/stories/user/${userId}`);
      return data.stories || data || [];
    } catch (err) {
      logger.error('Failed to fetch user stories:', err);
      return [];
    }
  },

  async createStory(input: { mediaUrl: string; mediaType: 'image' | 'video'; caption?: string; duration?: number }): Promise<Story> {
    const { data } = await apiClient.post('/stories', input);
    return data;
  },

  async uploadStoryMedia(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('media', file);
    const { data } = await apiClient.post('/stories/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async deleteStory(storyId: string): Promise<void> {
    await apiClient.delete(`/stories/${storyId}`);
  },

  async markViewed(storyId: string): Promise<void> {
    try {
      await apiClient.post(`/stories/${storyId}/view`);
    } catch (err) {
      logger.error('Failed to mark story viewed:', err);
    }
  },

  async reactToStory(storyId: string, emoji: string): Promise<StoryReaction> {
    const { data } = await apiClient.post(`/stories/${storyId}/react`, { emoji });
    return data;
  },

  async replyToStory(storyId: string, message: string): Promise<void> {
    await apiClient.post(`/stories/${storyId}/reply`, { message });
  },

  async getStoryViewers(storyId: string): Promise<StoryViewerProfile[]> {
    try {
      const { data } = await apiClient.get(`/stories/${storyId}/viewers`);
      return data.viewers || data || [];
    } catch (err) {
      logger.error('Failed to fetch story viewers:', err);
      return [];
    }
  },
};

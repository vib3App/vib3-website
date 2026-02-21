import { apiClient } from '@/services/api/client';
import type { StoryGroup, Story, StoryReaction, StoryViewerProfile } from '@/types/story';

export const storiesApi = {
  async getStoryFeed(): Promise<StoryGroup[]> {
    const { data } = await apiClient.get('/stories/feed');
    return data.storyGroups || data || [];
  },

  async getUserStories(userId: string): Promise<Story[]> {
    const { data } = await apiClient.get(`/stories/user/${userId}`);
    return data.stories || data || [];
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
    await apiClient.post(`/stories/${storyId}/view`);
  },

  async reactToStory(storyId: string, emoji: string): Promise<StoryReaction> {
    const { data } = await apiClient.post(`/stories/${storyId}/react`, { emoji });
    return data;
  },

  async replyToStory(storyId: string, message: string): Promise<void> {
    await apiClient.post(`/stories/${storyId}/reply`, { message });
  },

  async getStoryViewers(storyId: string): Promise<StoryViewerProfile[]> {
    const { data } = await apiClient.get(`/stories/${storyId}/viewers`);
    return data.viewers || data || [];
  },
};

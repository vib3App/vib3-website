import { apiClient } from '../client';
import type { Remix, RemixType } from '@/types/collaboration';

export const remixApi = {
  async getVideoRemixes(
    videoId: string,
    type?: RemixType,
    page = 1
  ): Promise<{ remixes: Remix[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ remixes: Remix[]; hasMore: boolean }>(
      `/videos/${videoId}/remixes`,
      { params: { type, page } }
    );
    return data;
  },

  async getMyRemixes(type?: RemixType): Promise<Remix[]> {
    const { data } = await apiClient.get<{ remixes: Remix[] }>('/remixes/my', {
      params: { type },
    });
    return data.remixes;
  },

  async createRemix(
    type: RemixType,
    originalVideoId: string,
    videoUrl: string,
    options?: {
      title?: string;
      description?: string;
      splitPosition?: number;
    }
  ): Promise<Remix> {
    const { data } = await apiClient.post<{ remix: Remix }>('/remixes', {
      type,
      originalVideoId,
      videoUrl,
      ...options,
    });
    return data.remix;
  },

  async deleteRemix(remixId: string): Promise<void> {
    await apiClient.delete(`/remixes/${remixId}`);
  },

  async checkRemixPermission(videoId: string): Promise<{
    allowEcho: boolean;
    allowDuet: boolean;
    allowStitch: boolean;
    allowRemix: boolean;
  }> {
    const { data } = await apiClient.get<{
      allowEcho: boolean;
      allowDuet: boolean;
      allowStitch: boolean;
      allowRemix: boolean;
    }>(`/videos/${videoId}/remix-settings`);
    return data;
  },
};

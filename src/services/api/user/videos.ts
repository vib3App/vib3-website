import { apiClient } from '../client';
import type { Video } from '@/types';
import type { UserVideosResponse, BackendVideo } from './types';
import { type VideoResponse, transformVideo as canonicalTransformVideo } from '../videoTransformers';
import { logger } from '@/utils/logger';

function transformVideo(v: BackendVideo, fallbackUserId?: string): Video {
  const video = canonicalTransformVideo(v as unknown as VideoResponse);
  if (!video.userId && fallbackUserId) {
    video.userId = fallbackUserId;
  }
  return video;
}

export const userVideosApi = {
  async getUserVideos(userId: string, page: number = 1, limit: number = 100): Promise<UserVideosResponse> {
    try {
      const { data } = await apiClient.get<BackendVideo[] | { videos?: BackendVideo[] }>(`/videos/user/${userId}`, {
        params: { page, limit }
      });

      const videosArray = Array.isArray(data) ? data : (data.videos || []);
      const videos: Video[] = videosArray.map(v => transformVideo(v, userId));

      return { videos };
    } catch (error) {
      logger.error('Failed to fetch user videos:', error);
      return { videos: [] };
    }
  },

  async getMyVideos(page: number = 1, limit: number = 20): Promise<UserVideosResponse> {
    const { data } = await apiClient.get<UserVideosResponse>('/user/videos', {
      params: { page, limit }
    });
    return data;
  },

  async getLikedVideos(page = 1, limit = 20): Promise<UserVideosResponse> {
    try {
      const { data } = await apiClient.get<BackendVideo[] | { videos?: BackendVideo[]; likedVideos?: BackendVideo[] }>('/user/liked-videos', {
        params: { page, limit },
      });

      let videosArray: BackendVideo[] = [];
      if (Array.isArray(data)) {
        videosArray = data;
      } else if (data.videos) {
        videosArray = data.videos;
      } else if (data.likedVideos) {
        videosArray = data.likedVideos;
      }

      const videos: Video[] = videosArray.map(v => transformVideo(v));

      return { videos };
    } catch (error) {
      logger.error('Failed to fetch liked videos:', error);
      return { videos: [] };
    }
  },

  async getTaggedVideos(page = 1, limit = 20): Promise<UserVideosResponse> {
    try {
      const { data } = await apiClient.get<{ videos?: BackendVideo[] }>('/social/user/tagged-videos', {
        params: { page, limit },
      });
      const videosArray = data.videos || [];
      return { videos: videosArray.map(v => transformVideo(v)) };
    } catch {
      return { videos: [] };
    }
  },
};

import { apiClient } from '../client';
import type { Video } from '@/types';
import type { UserVideosResponse, BackendVideo } from './types';

function transformVideo(v: BackendVideo, fallbackUserId?: string): Video {
  return {
    id: v.id || v._id || '',
    userId: v.userId || v.author?._id || fallbackUserId || '',
    username: v.author?.username || 'Unknown',
    userAvatar: v.author?.profileImage,
    caption: v.caption || v.title || v.description || '',
    videoUrl: v.media?.[0]?.url || '',
    thumbnailUrl: v.media?.[0]?.thumbnailUrl,
    duration: v.duration || 0,
    likesCount: v.likesCount || 0,
    commentsCount: v.commentsCount || 0,
    viewsCount: v.viewsCount || 0,
    sharesCount: v.sharesCount || 0,
    hashtags: v.hashtags || v.tags || [],
    createdAt: v.createdAt || new Date().toISOString(),
    isLiked: v.isLiked,
  };
}

export const userVideosApi = {
  async getUserVideos(userId: string, page: number = 1, limit: number = 100): Promise<UserVideosResponse> {
    try {
      const { data } = await apiClient.get<BackendVideo[] | { videos?: BackendVideo[] }>(`/videos/user/${userId}`, {
        params: { page, limit }
      });

      const videosArray = Array.isArray(data) ? data : (data.videos || []);
      const videos: Video[] = videosArray.map(v => transformVideo(v, userId));

      console.log(`[userApi.getUserVideos] Fetched ${videos.length} videos for user ${userId}`);
      return { videos };
    } catch (error) {
      console.error('Failed to fetch user videos:', error);
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

      console.log(`[userApi.getLikedVideos] Fetched ${videos.length} liked videos`);
      return { videos };
    } catch (error) {
      console.error('Failed to fetch liked videos:', error);
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

/**
 * Video API service
 * Handles video operations: fetch, like, view, comments
 */
import { apiClient } from './client';
import type { Video, Comment, PaginatedResponse } from '@/types';

interface VideoResponse {
  _id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  videoUrl: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  caption: string;
  hashtags: string[];
  duration: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  isPublic: boolean;
  createdAt: string;
}

interface CommentResponse {
  _id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  content: string;
  likesCount: number;
  createdAt: string;
  replies?: CommentResponse[];
}

export const videoApi = {
  /**
   * Get single video by ID
   */
  async getVideo(videoId: string): Promise<Video> {
    const { data } = await apiClient.get<VideoResponse>(`/videos/${videoId}`);
    return transformVideo(data);
  },

  /**
   * Like/unlike a video (toggle)
   */
  async toggleLike(videoId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data } = await apiClient.post<{ liked: boolean; likesCount: number }>(
      `/videos/${videoId}/like`
    );
    return data;
  },

  /**
   * Record a view
   */
  async recordView(videoId: string): Promise<void> {
    await apiClient.post(`/videos/${videoId}/view`);
  },

  /**
   * Get video comments
   */
  async getComments(
    videoId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Comment>> {
    const { data } = await apiClient.get<{
      comments: CommentResponse[];
      total: number;
      page: number;
      hasMore: boolean;
    }>(`/videos/${videoId}/comments`, { params: { page, limit } });

    return {
      items: data.comments.map(transformComment),
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  /**
   * Add a comment
   */
  async addComment(videoId: string, content: string): Promise<Comment> {
    const { data } = await apiClient.post<CommentResponse>(
      `/videos/${videoId}/comments`,
      { content }
    );
    return transformComment(data);
  },

  /**
   * Delete a comment
   */
  async deleteComment(videoId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/videos/${videoId}/comments/${commentId}`);
  },

  /**
   * Share video - record share
   */
  async shareVideo(videoId: string, platform?: string): Promise<void> {
    await apiClient.post(`/videos/${videoId}/share`, { platform });
  },

  /**
   * Check if user liked a video
   */
  async checkLiked(videoId: string): Promise<boolean> {
    try {
      const { data } = await apiClient.get<{ liked: boolean }>(`/videos/${videoId}/liked`);
      return data.liked;
    } catch {
      return false;
    }
  },
};

function transformVideo(data: VideoResponse): Video {
  return {
    id: data._id,
    userId: data.userId,
    username: data.username,
    userAvatar: data.profilePicture,
    videoUrl: data.hlsUrl || data.videoUrl,
    thumbnailUrl: data.thumbnailUrl,
    caption: data.caption,
    hashtags: data.hashtags || [],
    duration: data.duration,
    likesCount: data.likesCount || 0,
    commentsCount: data.commentsCount || 0,
    viewsCount: data.viewsCount || 0,
    sharesCount: data.sharesCount || 0,
    isPublic: data.isPublic,
    createdAt: data.createdAt,
  };
}

function transformComment(data: CommentResponse): Comment {
  return {
    id: data._id,
    userId: data.userId,
    username: data.username,
    userAvatar: data.profilePicture,
    content: data.content,
    likesCount: data.likesCount || 0,
    createdAt: data.createdAt,
    replies: data.replies?.map(transformComment),
  };
}

/**
 * Video API service
 * Handles video operations: fetch, like, view, comments
 */
import { apiClient } from './client';
import type { Video, Comment, PaginatedResponse } from '@/types';
import {
  type VideoResponse,
  type CommentResponse,
  transformVideo,
  transformComment,
} from './videoTransformers';

export const videoApi = {
  async getVideo(videoId: string): Promise<Video> {
    const { data } = await apiClient.get<VideoResponse>(`/videos/${videoId}`);
    return transformVideo(data);
  },

  async toggleLike(videoId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data } = await apiClient.post<{ liked: boolean; likesCount: number }>(
      `/videos/${videoId}/like`
    );
    return data;
  },

  async recordView(videoId: string): Promise<void> {
    await apiClient.post(`/videos/${videoId}/view`);
  },

  // GAP-50: Added sort parameter for comment sorting
  async getComments(
    videoId: string,
    page = 1,
    limit = 20,
    sort: 'newest' | 'top' | 'oldest' = 'top'
  ): Promise<PaginatedResponse<Comment>> {
    const { data } = await apiClient.get<{
      comments: CommentResponse[];
      total: number;
      page: number;
      hasMore: boolean;
    }>(`/videos/${videoId}/comments`, { params: { page, limit, sort } });

    return {
      items: data.comments.map(transformComment),
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  async addComment(videoId: string, content: string): Promise<Comment> {
    const { data } = await apiClient.post<CommentResponse>(
      `/videos/${videoId}/comments`,
      { text: content }
    );
    return transformComment(data);
  },

  async deleteComment(videoId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/videos/${videoId}/comments/${commentId}`);
  },

  async toggleCommentLike(videoId: string, commentId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data } = await apiClient.post<{ liked: boolean; likesCount: number }>(
      `/videos/${videoId}/comments/${commentId}/like`
    );
    return data;
  },

  async getCommentReplies(
    videoId: string,
    commentId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Comment>> {
    const { data } = await apiClient.get<{
      replies: CommentResponse[];
      total: number;
      page: number;
      hasMore: boolean;
    }>(`/videos/${videoId}/comments/${commentId}/replies`, { params: { page, limit } });

    return {
      items: data.replies.map(transformComment),
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  async replyToComment(
    videoId: string,
    commentId: string,
    content: string
  ): Promise<Comment> {
    const { data } = await apiClient.post<CommentResponse>(
      `/videos/${videoId}/comments/${commentId}/replies`,
      { text: content }
    );
    return transformComment(data);
  },

  async addVoiceComment(videoId: string, audioBlob: Blob): Promise<Comment> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-comment.webm');

    const { data } = await apiClient.post<CommentResponse>(
      `/videos/${videoId}/comments/voice`,
      formData
    );
    return transformComment(data);
  },

  async shareVideo(videoId: string, platform?: string): Promise<void> {
    await apiClient.post(`/videos/${videoId}/share`, { platform });
  },

  // GAP-11: Repost toggle
  async toggleRepost(videoId: string): Promise<{ reposted: boolean; repostsCount: number }> {
    const { data } = await apiClient.post<{ reposted: boolean; repostsCount: number }>(
      `/videos/${videoId}/repost`
    );
    return data;
  },

  async toggleFavorite(videoId: string): Promise<{ favorited: boolean; favoriteCount: number }> {
    const { data } = await apiClient.post<{ favorited: boolean; favoriteCount: number }>(
      `/videos/${videoId}/favorite`
    );
    return data;
  },

  async checkLiked(videoId: string): Promise<boolean> {
    try {
      const { data } = await apiClient.get<{ liked: boolean }>(`/videos/${videoId}/liked`);
      return data.liked;
    } catch {
      return false;
    }
  },

  async deleteVideo(videoId: string): Promise<void> {
    await apiClient.delete(`/videos/${videoId}`);
  },
};

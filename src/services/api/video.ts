/**
 * Video API service
 * Handles video operations: fetch, like, view, comments
 */
import { apiClient } from './client';
import type { Video, Comment, PaginatedResponse } from '@/types';

interface VideoResponse {
  _id: string;
  id?: string;
  userId?: string;
  // Backend returns user info in author object, not at top level
  author?: {
    _id?: string;
    username?: string;
    displayName?: string;
    profileImage?: string;
  };
  // Legacy flat fields (for backwards compatibility)
  username?: string;
  profilePicture?: string;
  // Backend returns video/thumbnail in media array
  media?: Array<{
    url?: string;
    thumbnailUrl?: string;
  }>;
  // Legacy flat fields
  videoUrl?: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  tags?: string[];
  duration?: number;
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  sharesCount?: number;
  isPublic?: boolean;
  createdAt?: string;
}

interface CommentResponse {
  _id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  content: string;
  likesCount: number;
  replyCount?: number;
  createdAt: string;
  replies?: CommentResponse[];
  isLiked?: boolean;
  parentId?: string;
  voiceUrl?: string;
  voiceDuration?: number;
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
   * Like/unlike a comment
   */
  async toggleCommentLike(videoId: string, commentId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data } = await apiClient.post<{ liked: boolean; likesCount: number }>(
      `/videos/${videoId}/comments/${commentId}/like`
    );
    return data;
  },

  /**
   * Get replies to a comment
   */
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

  /**
   * Reply to a comment
   */
  async replyToComment(
    videoId: string,
    commentId: string,
    content: string
  ): Promise<Comment> {
    const { data } = await apiClient.post<CommentResponse>(
      `/videos/${videoId}/comments/${commentId}/replies`,
      { content }
    );
    return transformComment(data);
  },

  /**
   * Add a voice comment
   */
  async addVoiceComment(videoId: string, audioBlob: Blob): Promise<Comment> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-comment.webm');

    const { data } = await apiClient.post<CommentResponse>(
      `/videos/${videoId}/comments/voice`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return transformComment(data);
  },

  /**
   * Share video - record share
   */
  async shareVideo(videoId: string, platform?: string): Promise<void> {
    await apiClient.post(`/videos/${videoId}/share`, { platform });
  },

  /**
   * Favorite/unfavorite a video (toggle)
   */
  async toggleFavorite(videoId: string): Promise<{ favorited: boolean; favoriteCount: number }> {
    const { data } = await apiClient.post<{ favorited: boolean; favoriteCount: number }>(
      `/videos/${videoId}/favorite`
    );
    return data;
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
  // Extract user info from author object or flat fields
  const username = data.author?.username || data.username || 'Unknown';
  const userAvatar = data.author?.profileImage || data.profilePicture;
  const userId = data.userId || data.author?._id || '';

  // Extract video/thumbnail from media array or flat fields
  const videoUrl = data.media?.[0]?.url || data.hlsUrl || data.videoUrl || '';
  const thumbnailUrl = data.media?.[0]?.thumbnailUrl || data.thumbnailUrl;

  return {
    id: data.id || data._id,
    userId,
    username,
    userAvatar,
    videoUrl,
    thumbnailUrl,
    caption: data.caption || data.title || data.description || '',
    hashtags: data.hashtags || data.tags || [],
    duration: data.duration || 0,
    likesCount: data.likesCount || 0,
    commentsCount: data.commentsCount || 0,
    viewsCount: data.viewsCount || 0,
    sharesCount: data.sharesCount || 0,
    isPublic: data.isPublic !== false,
    createdAt: data.createdAt || new Date().toISOString(),
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
    replyCount: data.replyCount || 0,
    createdAt: data.createdAt,
    replies: data.replies?.map(transformComment),
    isLiked: data.isLiked,
    parentId: data.parentId,
    voiceUrl: data.voiceUrl,
    voiceDuration: data.voiceDuration,
  };
}

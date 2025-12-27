/**
 * Feed API service
 * Handles video feeds: For You, Following, Trending, etc.
 */
import { apiClient } from './client';
import type { Video, PaginatedResponse } from '@/types';

type FeedType = 'forYou' | 'following' | 'friends' | 'trending' | 'discover';
type VibeType = 'Energetic' | 'Chill' | 'Creative' | 'Social' | 'Romantic' | 'Funny' | 'Inspirational';

interface FeedVideoResponse {
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
  isLiked?: boolean;
}

interface FeedResponse {
  videos: FeedVideoResponse[];
  page: number;
  hasMore: boolean;
  total?: number;
}

export const feedApi = {
  /**
   * Get For You feed (personalized)
   */
  async getForYouFeed(page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    const { data } = await apiClient.get<FeedResponse>('/feed/for-you', {
      params: { page, limit },
    });
    return transformFeedResponse(data);
  },

  /**
   * Get Following feed
   */
  async getFollowingFeed(page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    const { data } = await apiClient.get<FeedResponse>('/feed/following', {
      params: { page, limit },
    });
    return transformFeedResponse(data);
  },

  /**
   * Get Trending feed
   */
  async getTrendingFeed(page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    const { data } = await apiClient.get<FeedResponse>('/feed/trending', {
      params: { page, limit },
    });
    return transformFeedResponse(data);
  },

  /**
   * Get Discover feed
   */
  async getDiscoverFeed(page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    const { data } = await apiClient.get<FeedResponse>('/feed/discover', {
      params: { page, limit },
    });
    return transformFeedResponse(data);
  },

  /**
   * Get feed by vibe (mood)
   */
  async getVibesFeed(vibe: VibeType, page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    const { data } = await apiClient.get<FeedResponse>('/feed/vibes', {
      params: { vibe, page, limit },
    });
    return transformFeedResponse(data);
  },

  /**
   * Get hashtag feed
   */
  async getHashtagFeed(hashtag: string, page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    const { data } = await apiClient.get<FeedResponse>(`/feed/hashtag/${encodeURIComponent(hashtag)}`, {
      params: { page, limit },
    });
    return transformFeedResponse(data);
  },

  /**
   * Get user's videos
   */
  async getUserVideos(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    const { data } = await apiClient.get<FeedResponse>(`/users/${userId}/videos`, {
      params: { page, limit },
    });
    return transformFeedResponse(data);
  },

  /**
   * Search videos
   */
  async searchVideos(query: string, page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    const { data } = await apiClient.get<FeedResponse>('/search/videos', {
      params: { q: query, page, limit },
    });
    return transformFeedResponse(data);
  },

  /**
   * Get generic feed (For You is default)
   */
  async getFeed(
    type: FeedType = 'forYou',
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Video>> {
    switch (type) {
      case 'following':
        return this.getFollowingFeed(page, limit);
      case 'trending':
        return this.getTrendingFeed(page, limit);
      case 'discover':
        return this.getDiscoverFeed(page, limit);
      default:
        return this.getForYouFeed(page, limit);
    }
  },
};

function transformFeedResponse(data: FeedResponse): PaginatedResponse<Video> {
  return {
    items: data.videos.map(transformVideo),
    page: data.page,
    hasMore: data.hasMore,
    total: data.total,
  };
}

function transformVideo(data: FeedVideoResponse): Video {
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
    isLiked: data.isLiked,
  };
}

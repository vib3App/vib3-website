/**
 * Feed API service
 * Handles video feeds: For You, Following, Trending, Category feeds, etc.
 */
import { apiClient } from './client';
import type { Video, PaginatedResponse, FeedOrder } from '@/types';

type FeedType = 'forYou' | 'following' | 'friends' | 'trending' | 'discover' | 'self';
type VibeType = 'Energetic' | 'Chill' | 'Creative' | 'Social' | 'Romantic' | 'Funny' | 'Inspirational';

interface FeedVideoResponse {
  _id: string;
  userId?: string;
  username?: string;
  profilePicture?: string;
  videoUrl: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  duration: number;
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  sharesCount?: number;
  likes?: number;
  comments?: number;
  views?: number;
  shares?: number;
  isPublic?: boolean;
  createdAt: string;
  isLiked?: boolean;
  // Nested user object from API
  user?: {
    _id: string;
    username: string;
    displayName?: string;
    profileImage?: string;
    profilePicture?: string;
  };
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
    try {
      const { data } = await apiClient.get<FeedResponse>('/videos', {
        params: { page, limit, feed: 'foryou' },
      });
      return transformFeedResponse(data);
    } catch (error) {
      console.error('Failed to get ForYou feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  /**
   * Get Following feed
   */
  async getFollowingFeed(page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/videos', {
        params: { page, limit, feed: 'following' },
      });
      return transformFeedResponse(data);
    } catch (error) {
      console.error('Failed to get Following feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  /**
   * Get Trending feed
   */
  async getTrendingFeed(page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/trending', {
        params: { page, limit },
      });
      return transformFeedResponse(data);
    } catch (error) {
      console.error('Failed to get Trending feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  /**
   * Get Discover feed
   */
  async getDiscoverFeed(page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/videos', {
        params: { page, limit, feed: 'discover' },
      });
      return transformFeedResponse(data);
    } catch (error) {
      console.error('Failed to get Discover feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  /**
   * Get feed by vibe (mood)
   * Maps vibe types to hashtag searches since backend doesn't have a dedicated vibes endpoint
   */
  async getVibesFeed(vibe: VibeType, page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    // Map vibes to relevant hashtags
    const vibeHashtags: Record<string, string> = {
      'Energetic': 'hype',
      'Chill': 'chill',
      'Creative': 'creative',
      'Social': 'friends',
      'Romantic': 'love',
      'Funny': 'funny',
      'Inspirational': 'motivation',
    };
    const hashtag = vibeHashtags[vibe] || vibe.toLowerCase();
    return this.getHashtagFeed(hashtag, page, limit);
  },

  /**
   * Get hashtag feed
   */
  async getHashtagFeed(hashtag: string, page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    try {
      // Backend uses /videos/hashtag/:hashtag
      const { data } = await apiClient.get<FeedResponse>(`/videos/hashtag/${encodeURIComponent(hashtag)}`, {
        params: { page, limit },
      });
      return transformFeedResponse(data);
    } catch (error) {
      console.error('Failed to get hashtag feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  /**
   * Get user's videos
   */
  async getUserVideos(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>(`/users/${userId}/videos`, {
        params: { page, limit },
      });
      return transformFeedResponse(data);
    } catch (error) {
      console.error('Failed to get user videos:', error);
      return { items: [], page, hasMore: false };
    }
  },

  /**
   * Search videos
   */
  async searchVideos(query: string, page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/search/videos', {
        params: { q: query, page, limit },
      });
      return transformFeedResponse(data);
    } catch (error) {
      console.error('Failed to search videos:', error);
      return { items: [], page, hasMore: false };
    }
  },

  /**
   * Get Friends feed (mutual follows only)
   * DISABLED: Backend doesn't support this endpoint yet (returns 404)
   * Immediately returns empty result to prevent API call and re-render loops
   */
  async getFriendsFeed(page = 1, _limit = 10): Promise<PaginatedResponse<Video>> {
    // Backend doesn't have /videos/friends endpoint - skip the API call entirely
    // This prevents 404 errors and potential re-render loops
    return { items: [], page, hasMore: false };
  },

  /**
   * Get user's own videos (My Videos / Self feed)
   * Uses /user/videos endpoint which is authenticated
   */
  async getSelfFeed(_userId: string, page = 1, limit = 10): Promise<PaginatedResponse<Video>> {
    try {
      // Use /user/videos which is the authenticated endpoint for current user's videos
      const { data } = await apiClient.get<FeedResponse>('/user/videos', {
        params: { page, limit },
      });
      console.log('[feedApi.getSelfFeed] Fetched videos:', data.videos?.length || 0);
      return transformFeedResponse(data);
    } catch (error) {
      console.error('Failed to get self feed:', error);
      // Return empty result on error to prevent re-render loops
      return { items: [], page, hasMore: false };
    }
  },

  /**
   * Get category-specific feed
   * For custom categories, returns videos from users assigned to that category
   */
  async getCategoryFeed(
    categoryId: string,
    page = 1,
    limit = 10,
    feedOrder: FeedOrder = 'chronological'
  ): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>(`/videos/category/${categoryId}`, {
        params: { page, limit, order: feedOrder },
      });
      return transformFeedResponse(data);
    } catch (error) {
      console.error('Failed to get category feed:', error);
      return { items: [], page, hasMore: false };
    }
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
      case 'friends':
        return this.getFriendsFeed(page, limit);
      case 'trending':
        return this.getTrendingFeed(page, limit);
      case 'discover':
        return this.getDiscoverFeed(page, limit);
      default:
        return this.getForYouFeed(page, limit);
    }
  },

  /**
   * Get feed by category - handles all category types
   */
  async getFeedByCategory(
    categoryId: string,
    page = 1,
    limit = 10,
    userId?: string,
    feedOrder: FeedOrder = 'chronological'
  ): Promise<PaginatedResponse<Video>> {
    switch (categoryId) {
      case 'foryou':
        return this.getForYouFeed(page, limit);
      case 'following':
        return this.getFollowingFeed(page, limit);
      case 'friends':
        return this.getFriendsFeed(page, limit);
      case 'self':
        if (!userId) {
          return { items: [], page, hasMore: false };
        }
        return this.getSelfFeed(userId, page, limit);
      default:
        // Custom or default categories (family, etc.)
        return this.getCategoryFeed(categoryId, page, limit, feedOrder);
    }
  },
};

function transformFeedResponse(data: FeedResponse): PaginatedResponse<Video> {
  // Defensive check - ensure videos array exists
  const videos = data?.videos || [];
  return {
    items: videos.map(transformVideo),
    page: data?.page || 1,
    hasMore: data?.hasMore ?? false,
    total: data?.total,
  };
}

function transformVideo(data: FeedVideoResponse): Video {
  // Extract user info - could be at top level or nested in user object
  const userId = data.userId || data.user?._id || '';
  const username = data.username || data.user?.username || 'unknown';
  const userAvatar = data.profilePicture || data.user?.profileImage || data.user?.profilePicture;

  return {
    id: data._id,
    userId,
    username,
    userAvatar,
    videoUrl: data.hlsUrl || data.videoUrl,
    thumbnailUrl: data.thumbnailUrl,
    caption: data.caption || data.title || data.description || '',
    hashtags: data.hashtags || [],
    duration: data.duration,
    likesCount: data.likesCount || data.likes || 0,
    commentsCount: data.commentsCount || data.comments || 0,
    viewsCount: data.viewsCount || data.views || 0,
    sharesCount: data.sharesCount || data.shares || 0,
    isPublic: data.isPublic !== false,
    createdAt: data.createdAt,
    isLiked: data.isLiked,
  };
}

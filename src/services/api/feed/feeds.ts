import { apiClient } from '../client';
import type { Video, PaginatedResponse, FeedOrder } from '@/types';
import { FeedResponse, FeedVideoResponse, FeedType, VibeType, transformFeedResponse, transformVideo } from './types';
import { logger } from '@/utils/logger';

/**
 * Normalize any backend response shape into PaginatedResponse<Video>.
 * The backend returns different formats depending on the endpoint:
 * - { videos: [...], page, hasMore, total }
 * - { data: [...] }
 * - [...] (plain array)
 */
function normalizeFeedResponse(data: unknown, page: number, limit: number): PaginatedResponse<Video> {
  // Standard feed response: { videos: [...] }
  if (data && typeof data === 'object' && 'videos' in data) {
    return transformFeedResponse(data as FeedResponse);
  }
  // Array wrapper: { data: [...] }
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data)) {
    const videos = ((data as { data: FeedVideoResponse[] }).data).map(transformVideo);
    return { items: videos, page, hasMore: videos.length >= limit };
  }
  // Plain array
  if (Array.isArray(data)) {
    const videos = data.map(transformVideo);
    return { items: videos, page, hasMore: videos.length >= limit };
  }
  return { items: [], page, hasMore: false };
}

export const feedsApi = {
  async getForYouFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get('/videos', { params: { page, limit, feed: 'foryou' } });
      return normalizeFeedResponse(data, page, limit);
    } catch (error) {
      logger.error('Failed to get ForYou feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  // Use dedicated /videos/following endpoint (JWT-verified, matches Flutter)
  // Falls back to /videos?feed=following if dedicated endpoint fails
  async getFollowingFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    const offset = (page - 1) * limit;
    try {
      const { data } = await apiClient.get('/videos/following', {
        params: { offset, limit, sort: 'newest' }
      });
      return normalizeFeedResponse(data, page, limit);
    } catch (error) {
      // Fallback to main feed endpoint
      try {
        const { data } = await apiClient.get('/videos', { params: { page, limit, feed: 'following' } });
        return normalizeFeedResponse(data, page, limit);
      } catch (fallbackError) {
        logger.error('Failed to get Following feed:', fallbackError);
        return { items: [], page, hasMore: false };
      }
    }
  },

  async getTrendingFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get('/trending', { params: { page, limit } });
      return normalizeFeedResponse(data, page, limit);
    } catch (error) {
      logger.error('Failed to get Trending feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getDiscoverFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get('/videos', { params: { page, limit, feed: 'discover' } });
      return normalizeFeedResponse(data, page, limit);
    } catch (error) {
      logger.error('Failed to get Discover feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  // Use dedicated /videos/friends endpoint (JWT-verified, matches Flutter)
  // Falls back to /videos?feed=friends if dedicated endpoint fails
  async getFriendsFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    const offset = (page - 1) * limit;
    try {
      const { data } = await apiClient.get('/videos/friends', {
        params: { offset, limit, sort: 'newest' }
      });
      return normalizeFeedResponse(data, page, limit);
    } catch (error) {
      // Fallback to main feed endpoint
      try {
        const { data } = await apiClient.get('/videos', { params: { page, limit, feed: 'friends' } });
        return normalizeFeedResponse(data, page, limit);
      } catch (fallbackError) {
        logger.error('Failed to get Friends feed:', fallbackError);
        return { items: [], page, hasMore: false };
      }
    }
  },

  // Self feed: Try multiple endpoints like Flutter does
  async getSelfFeed(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    const offset = (page - 1) * limit;
    const endpoints = [
      { url: '/user/videos', params: { userId, limit, offset } },
      { url: `/videos/user/${userId}`, params: { limit, offset } },
      { url: '/videos', params: { userId, limit, offset } },
    ];

    for (const endpoint of endpoints) {
      try {
        const { data } = await apiClient.get(endpoint.url, { params: endpoint.params });
        const result = normalizeFeedResponse(data, page, limit);
        if (result.items.length > 0) return result;
      } catch {
        // Try next endpoint
      }
    }

    logger.error('Failed to get self feed from all endpoints');
    return { items: [], page, hasMore: false };
  },

  async getCategoryFeed(categoryId: string, page = 1, limit = 20, feedOrder: FeedOrder = 'chronological'): Promise<PaginatedResponse<Video>> {
    try {
      // Use /videos?feed=categoryFeed&categoryId=X to match backend expectation
      const { data } = await apiClient.get('/videos', {
        params: { page, limit, feed: 'categoryFeed', categoryId, order: feedOrder }
      });
      return normalizeFeedResponse(data, page, limit);
    } catch (error) {
      logger.error('Failed to get category feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  // Use dedicated /videos?feed=family endpoint (matches backend route)
  async getFamilyFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get('/videos', { params: { page, limit, feed: 'family' } });
      return normalizeFeedResponse(data, page, limit);
    } catch (error) {
      logger.error('Failed to get Family feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getUserVideos(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get(`/videos/user/${userId}`, { params: { page, limit } });
      return normalizeFeedResponse(data, page, limit);
    } catch (error) {
      logger.error('Failed to get user videos:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getHashtagFeed(hashtag: string, page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get(`/videos/hashtag/${encodeURIComponent(hashtag)}`, { params: { page, limit } });
      return normalizeFeedResponse(data, page, limit);
    } catch (error) {
      logger.error('Failed to get hashtag feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getVibesFeed(vibe: VibeType, page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get('/videos', { params: { page, limit, vibe } });
      return normalizeFeedResponse(data, page, limit);
    } catch (error) {
      logger.error('Failed to get vibe feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async searchVideos(query: string, page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get('/search/videos', { params: { q: query, page, limit } });
      return normalizeFeedResponse(data, page, limit);
    } catch (error) {
      logger.error('Failed to search videos:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getFeed(type: FeedType = 'forYou', page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    switch (type) {
      case 'following': return this.getFollowingFeed(page, limit);
      case 'friends': return this.getFriendsFeed(page, limit);
      case 'trending': return this.getTrendingFeed(page, limit);
      case 'discover': return this.getDiscoverFeed(page, limit);
      default: return this.getForYouFeed(page, limit);
    }
  },

  async getFeedByCategory(categoryId: string, page = 1, limit = 20, userId?: string, feedOrder: FeedOrder = 'chronological'): Promise<PaginatedResponse<Video>> {
    switch (categoryId) {
      case 'foryou': return this.getForYouFeed(page, limit);
      case 'following': return this.getFollowingFeed(page, limit);
      case 'friends': return this.getFriendsFeed(page, limit);
      case 'family': return this.getFamilyFeed(page, limit);
      case 'self': return userId ? this.getSelfFeed(userId, page, limit) : { items: [], page, hasMore: false };
      default: return this.getCategoryFeed(categoryId, page, limit, feedOrder);
    }
  },
};

import { apiClient } from '../client';
import type { Video, PaginatedResponse, FeedOrder } from '@/types';
import { FeedResponse, FeedVideoResponse, FeedType, VibeType, transformFeedResponse, transformVideo } from './types';
import { logger } from '@/utils/logger';

const _vibeHashtags: Record<string, string> = {
  'Energetic': 'hype', 'Chill': 'chill', 'Creative': 'creative', 'Social': 'friends',
  'Romantic': 'love', 'Funny': 'funny', 'Inspirational': 'motivation',
};

export const feedsApi = {
  async getForYouFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/videos', { params: { page, limit, feed: 'foryou' } });
      return transformFeedResponse(data);
    } catch (error) {
      logger.error('Failed to get ForYou feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getFollowingFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/videos', { params: { page, limit, feed: 'following' } });
      return transformFeedResponse(data);
    } catch (error) {
      logger.error('Failed to get Following feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getTrendingFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/trending', { params: { page, limit } });
      return transformFeedResponse(data);
    } catch (error) {
      logger.error('Failed to get Trending feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getDiscoverFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/videos', { params: { page, limit, feed: 'discover' } });
      return transformFeedResponse(data);
    } catch (error) {
      logger.error('Failed to get Discover feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getFriendsFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/videos', { params: { page, limit, feed: 'friends' } });
      return transformFeedResponse(data);
    } catch (error) {
      logger.error('Failed to get Friends feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getSelfFeed(_userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/user/videos', { params: { page, limit } });
      return transformFeedResponse(data);
    } catch (error) {
      logger.error('Failed to get self feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getCategoryFeed(categoryId: string, page = 1, limit = 20, feedOrder: FeedOrder = 'chronological'): Promise<PaginatedResponse<Video>> {
    try {
      // Use /videos?feed=categoryFeed&categoryId=X to match backend expectation
      // (not /videos/category/:id which is a public tag-based search endpoint)
      const { data } = await apiClient.get<FeedResponse>('/videos', {
        params: { page, limit, feed: 'categoryFeed', categoryId, order: feedOrder }
      });
      return transformFeedResponse(data);
    } catch (error) {
      logger.error('Failed to get category feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getFamilyFeed(page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/videos', { params: { page, limit, feed: 'family' } });
      return transformFeedResponse(data);
    } catch (error) {
      logger.error('Failed to get Family feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getUserVideos(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedVideoResponse[] | FeedResponse>(`/videos/user/${userId}`, { params: { page, limit } });
      if (Array.isArray(data)) {
        return { items: data.map(transformVideo), page, hasMore: data.length >= limit };
      }
      return transformFeedResponse(data);
    } catch (error) {
      logger.error('Failed to get user videos:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getHashtagFeed(hashtag: string, page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>(`/videos/hashtag/${encodeURIComponent(hashtag)}`, { params: { page, limit } });
      return transformFeedResponse(data);
    } catch (error) {
      logger.error('Failed to get hashtag feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async getVibesFeed(vibe: VibeType, page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/videos', { params: { page, limit, vibe } });
      return transformFeedResponse(data);
    } catch (error) {
      logger.error('Failed to get vibe feed:', error);
      return { items: [], page, hasMore: false };
    }
  },

  async searchVideos(query: string, page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const { data } = await apiClient.get<FeedResponse>('/search/videos', { params: { q: query, page, limit } });
      return transformFeedResponse(data);
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

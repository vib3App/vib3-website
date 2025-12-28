/**
 * Search API service
 * Handles search operations with autocomplete and filters
 */
import { apiClient } from './client';
import type { Video, PaginatedResponse } from '@/types';

export interface SearchFilters {
  type?: 'all' | 'videos' | 'users' | 'sounds' | 'hashtags';
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  duration?: 'all' | 'short' | 'medium' | 'long'; // <30s, 30s-3m, >3m
  sortBy?: 'relevance' | 'date' | 'views' | 'likes';
}

export interface SearchSuggestion {
  type: 'query' | 'user' | 'hashtag' | 'sound';
  text: string;
  subtext?: string;
  avatar?: string;
  count?: number;
}

export interface SearchUser {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  isVerified?: boolean;
  followerCount: number;
  isFollowing?: boolean;
}

export interface SearchHashtag {
  name: string;
  videoCount: number;
  viewCount: number;
  trending?: boolean;
}

export interface SearchSound {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  duration: number;
  useCount: number;
}

export interface TranscriptMatch {
  videoId: string;
  timestamp: number;
  text: string;
  context: string;
}

export interface SearchResults {
  videos?: PaginatedResponse<Video>;
  users?: SearchUser[];
  hashtags?: SearchHashtag[];
  sounds?: SearchSound[];
  transcriptMatches?: TranscriptMatch[];
}

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

export const searchApi = {
  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    const { data } = await apiClient.get<{ suggestions: SearchSuggestion[] }>(
      '/search/suggestions',
      { params: { q: query } }
    );
    return data.suggestions;
  },

  /**
   * Search videos
   */
  async searchVideos(
    query: string,
    filters: SearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Video>> {
    const { data } = await apiClient.get<{
      videos: VideoResponse[];
      total: number;
      page: number;
      hasMore: boolean;
    }>('/search/videos', {
      params: { q: query, ...filters, page, limit },
    });

    return {
      items: data.videos.map(transformVideo),
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  /**
   * Search users
   */
  async searchUsers(query: string, page = 1, limit = 20): Promise<SearchUser[]> {
    const { data } = await apiClient.get<{ users: SearchUser[] }>('/search/users', {
      params: { q: query, page, limit },
    });
    return data.users;
  },

  /**
   * Search hashtags
   */
  async searchHashtags(query: string, limit = 20): Promise<SearchHashtag[]> {
    const { data } = await apiClient.get<{ hashtags: SearchHashtag[] }>('/search/hashtags', {
      params: { q: query, limit },
    });
    return data.hashtags;
  },

  /**
   * Search sounds
   */
  async searchSounds(query: string, page = 1, limit = 20): Promise<SearchSound[]> {
    const { data } = await apiClient.get<{ sounds: SearchSound[] }>('/search/sounds', {
      params: { q: query, page, limit },
    });
    return data.sounds;
  },

  /**
   * Search video transcripts
   */
  async searchTranscripts(
    query: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<TranscriptMatch>> {
    const { data } = await apiClient.get<{
      matches: TranscriptMatch[];
      total: number;
      page: number;
      hasMore: boolean;
    }>('/search/transcripts', {
      params: { q: query, page, limit },
    });

    return {
      items: data.matches,
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  /**
   * Combined search (all types)
   */
  async search(
    query: string,
    filters: SearchFilters = {},
    page = 1
  ): Promise<SearchResults> {
    const { data } = await apiClient.get<SearchResults>('/search', {
      params: { q: query, ...filters, page },
    });
    return data;
  },

  /**
   * Get trending searches
   */
  async getTrendingSearches(): Promise<string[]> {
    const { data } = await apiClient.get<{ searches: string[] }>('/search/trending');
    return data.searches;
  },

  /**
   * Get search history
   */
  async getSearchHistory(): Promise<string[]> {
    const { data } = await apiClient.get<{ history: string[] }>('/search/history');
    return data.history;
  },

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    await apiClient.delete('/search/history');
  },

  /**
   * Save a search to history
   */
  async saveSearch(query: string): Promise<void> {
    await apiClient.post('/search/history', { query });
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

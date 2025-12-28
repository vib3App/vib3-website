/**
 * AI API service
 * Handles AI-powered features like auto-captions, recommendations, and content moderation
 */
import { apiClient } from './client';
import type {
  AITranscript,
  ContentModerationResult,
  AIRecommendation,
  SmartSearchResult,
  AIFilter,
  VideoAnalysis,
  AISettings,
} from '@/types/ai';
import type { Video } from '@/types';

export const aiApi = {
  // ========== Auto-Captions ==========

  /**
   * Generate captions for a video
   */
  async generateCaptions(
    videoId: string,
    language = 'en'
  ): Promise<AITranscript> {
    const { data } = await apiClient.post<{ transcript: AITranscript }>(
      `/ai/captions/${videoId}`,
      { language }
    );
    return data.transcript;
  },

  /**
   * Get existing captions for a video
   */
  async getCaptions(videoId: string, language = 'en'): Promise<AITranscript | null> {
    try {
      const { data } = await apiClient.get<{ transcript: AITranscript }>(
        `/ai/captions/${videoId}`,
        { params: { language } }
      );
      return data.transcript;
    } catch {
      return null;
    }
  },

  /**
   * Get available caption languages for a video
   */
  async getCaptionLanguages(videoId: string): Promise<string[]> {
    const { data } = await apiClient.get<{ languages: string[] }>(
      `/ai/captions/${videoId}/languages`
    );
    return data.languages;
  },

  /**
   * Translate captions to another language
   */
  async translateCaptions(
    videoId: string,
    fromLanguage: string,
    toLanguage: string
  ): Promise<AITranscript> {
    const { data } = await apiClient.post<{ transcript: AITranscript }>(
      `/ai/captions/${videoId}/translate`,
      { fromLanguage, toLanguage }
    );
    return data.transcript;
  },

  // ========== Content Moderation ==========

  /**
   * Check content for moderation
   */
  async moderateContent(videoId: string): Promise<ContentModerationResult> {
    const { data } = await apiClient.post<{ result: ContentModerationResult }>(
      `/ai/moderation/${videoId}`
    );
    return data.result;
  },

  /**
   * Get moderation status for a video
   */
  async getModerationStatus(videoId: string): Promise<ContentModerationResult | null> {
    try {
      const { data } = await apiClient.get<{ result: ContentModerationResult }>(
        `/ai/moderation/${videoId}`
      );
      return data.result;
    } catch {
      return null;
    }
  },

  /**
   * Appeal a moderation decision
   */
  async appealModeration(
    videoId: string,
    reason: string
  ): Promise<{ appealId: string; status: string }> {
    const { data } = await apiClient.post<{ appealId: string; status: string }>(
      `/ai/moderation/${videoId}/appeal`,
      { reason }
    );
    return data;
  },

  // ========== Recommendations ==========

  /**
   * Get personalized video recommendations
   */
  async getRecommendations(limit = 20): Promise<AIRecommendation[]> {
    const { data } = await apiClient.get<{ recommendations: AIRecommendation[] }>(
      '/ai/recommendations',
      { params: { limit } }
    );
    return data.recommendations;
  },

  /**
   * Get similar videos to a specific video
   */
  async getSimilarVideos(videoId: string, limit = 10): Promise<Video[]> {
    const { data } = await apiClient.get<{ videos: Video[] }>(
      `/ai/similar/${videoId}`,
      { params: { limit } }
    );
    return data.videos;
  },

  /**
   * Record that a recommendation was viewed (for training)
   */
  async recordRecommendationView(
    recommendationId: string,
    action: 'viewed' | 'clicked' | 'ignored'
  ): Promise<void> {
    await apiClient.post('/ai/recommendations/feedback', {
      recommendationId,
      action,
    });
  },

  // ========== Smart Search ==========

  /**
   * Semantic search for videos
   */
  async semanticSearch(query: string, limit = 20): Promise<SmartSearchResult[]> {
    const { data } = await apiClient.get<{ results: SmartSearchResult[] }>(
      '/ai/search/semantic',
      { params: { q: query, limit } }
    );
    return data.results;
  },

  /**
   * Search within video transcripts
   */
  async searchTranscripts(
    query: string,
    limit = 20
  ): Promise<{ videoId: string; timestamp: number; text: string }[]> {
    const { data } = await apiClient.get<{
      results: { videoId: string; timestamp: number; text: string }[];
    }>('/ai/search/transcripts', { params: { q: query, limit } });
    return data.results;
  },

  // ========== AI Filters ==========

  /**
   * Get available AI filters
   */
  async getFilters(): Promise<AIFilter[]> {
    const { data } = await apiClient.get<{ filters: AIFilter[] }>('/ai/filters');
    return data.filters;
  },

  /**
   * Apply AI filter to video frame
   */
  async applyFilter(
    imageData: string,
    filterId: string,
    parameters?: Record<string, number | string>
  ): Promise<string> {
    const { data } = await apiClient.post<{ processedImage: string }>(
      '/ai/filters/apply',
      { imageData, filterId, parameters }
    );
    return data.processedImage;
  },

  // ========== Video Analysis ==========

  /**
   * Analyze video content
   */
  async analyzeVideo(videoId: string): Promise<VideoAnalysis> {
    const { data } = await apiClient.post<{ analysis: VideoAnalysis }>(
      `/ai/analyze/${videoId}`
    );
    return data.analysis;
  },

  /**
   * Get video analysis results
   */
  async getVideoAnalysis(videoId: string): Promise<VideoAnalysis | null> {
    try {
      const { data } = await apiClient.get<{ analysis: VideoAnalysis }>(
        `/ai/analyze/${videoId}`
      );
      return data.analysis;
    } catch {
      return null;
    }
  },

  /**
   * Generate video description from content
   */
  async generateDescription(videoId: string): Promise<string> {
    const { data } = await apiClient.post<{ description: string }>(
      `/ai/describe/${videoId}`
    );
    return data.description;
  },

  /**
   * Generate hashtag suggestions
   */
  async suggestHashtags(videoId: string): Promise<string[]> {
    const { data } = await apiClient.post<{ hashtags: string[] }>(
      `/ai/hashtags/${videoId}`
    );
    return data.hashtags;
  },

  // ========== AI Settings ==========

  /**
   * Get user's AI settings
   */
  async getSettings(): Promise<AISettings> {
    const { data } = await apiClient.get<{ settings: AISettings }>('/ai/settings');
    return data.settings;
  },

  /**
   * Update AI settings
   */
  async updateSettings(settings: Partial<AISettings>): Promise<AISettings> {
    const { data } = await apiClient.patch<{ settings: AISettings }>(
      '/ai/settings',
      settings
    );
    return data.settings;
  },
};

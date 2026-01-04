import { apiClient } from '../client';
import type { CreatorAnalytics, AnalyticsTrend, VideoPerformanceData, CreatorSettings } from '@/types/creator';

export const analyticsApi = {
  async getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<CreatorAnalytics> {
    const { data } = await apiClient.get<CreatorAnalytics>('/creator/analytics', { params: { period } });
    return data;
  },

  async getAnalyticsTrends(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsTrend[]> {
    const { data } = await apiClient.get<{ trends: AnalyticsTrend[] }>('/creator/analytics/trends', { params: { period } });
    return data.trends;
  },

  async getVideoPerformance(page = 1, limit = 20, sortBy: 'views' | 'likes' | 'recent' = 'recent'): Promise<{ videos: VideoPerformanceData[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ videos: VideoPerformanceData[]; hasMore: boolean }>('/creator/analytics/videos', { params: { page, limit, sortBy } });
    return data;
  },

  async getVideoAnalytics(videoId: string): Promise<VideoPerformanceData> {
    const { data } = await apiClient.get<{ video: VideoPerformanceData }>(`/creator/analytics/videos/${videoId}`);
    return data.video;
  },

  async getCreatorSettings(): Promise<CreatorSettings> {
    const { data } = await apiClient.get<CreatorSettings>('/creator/settings');
    return data;
  },

  async updateCreatorSettings(settings: Partial<CreatorSettings>): Promise<CreatorSettings> {
    const { data } = await apiClient.patch<CreatorSettings>('/creator/settings', settings);
    return data;
  },

  async applyForMonetization(): Promise<{ status: 'pending' | 'approved' | 'rejected' }> {
    const { data } = await apiClient.post<{ status: 'pending' | 'approved' | 'rejected' }>('/creator/monetization/apply');
    return data;
  },
};

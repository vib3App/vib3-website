/**
 * Analytics API service
 */
import { apiClient } from './client';
import type { AnalyticsDashboard, AnalyticsPeriod } from '@/types/analytics';

export const analyticsApi = {
  /**
   * Get creator analytics dashboard
   */
  async getCreatorAnalytics(period: AnalyticsPeriod = 7): Promise<AnalyticsDashboard> {
    const { data } = await apiClient.get<AnalyticsDashboard>('/analytics/creator', {
      params: { period },
    });
    return data;
  },

  /**
   * Get watch time analytics
   */
  async getWatchTime(period: AnalyticsPeriod = 7): Promise<{
    totalWatchTime: number;
    totalWatchTimeHours: string;
    totalViews: number;
    uniqueViewers: number;
    avgWatchTime: number;
    avgSessionsPerViewer: number;
    avgWatchPercentage: number;
  }> {
    const { data } = await apiClient.get('/analytics/watchtime', {
      params: { period },
    });
    return data;
  },

  /**
   * Get watch time for a specific video
   */
  async getVideoWatchTime(videoId: string): Promise<{
    videoId: string;
    totalWatchTime: number;
    totalViews: number;
    avgWatchTime: number;
    avgWatchPercentage: number;
    retentionCurve: number[];
  }> {
    const { data } = await apiClient.get(`/analytics/watchtime/video/${videoId}`);
    return data;
  },

  /**
   * Record a video view
   */
  async recordView(videoId: string, watchTime?: number, watchPercentage?: number): Promise<void> {
    await apiClient.post('/analytics/video-view', {
      videoId,
      watchTime,
      watchPercentage,
    });
  },

  /**
   * Record video playback data
   */
  async recordPlayback(data: {
    videoId: string;
    watchTime: number;
    watchPercentage: number;
    completed: boolean;
    pauseCount?: number;
    seekCount?: number;
  }): Promise<void> {
    await apiClient.post('/analytics/video-playback', data);
  },
};

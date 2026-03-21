import { apiClient } from '../client';
import type { QoEDashboard, QoEPeriod } from './types';
import { logger } from '@/utils/logger';

export const qoeApi = {
  async getQoESummary(period: QoEPeriod = '24h'): Promise<QoEDashboard> {
    try {
      const { data } = await apiClient.get<QoEDashboard>('/analytics/qoe/summary', {
        params: { period },
      });
      return data;
    } catch (error) {
      logger.error('Failed to get QoE summary:', error);
      return {
        period,
        summary: {
          totalSessions: 0,
          avgStartupLatencyMs: 0,
          p50StartupLatencyMs: 0,
          p95StartupLatencyMs: 0,
          avgQoeScore: 0,
          p50QoeScore: 0,
          stallRate: 0,
          avgRebufferRatio: 0,
          avgWatchTimeSec: 0,
          errorRate: 0,
          totalErrors: 0,
        },
        timeSeries: [],
        worstVideos: [],
      };
    }
  },
};

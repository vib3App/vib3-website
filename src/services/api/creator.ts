/**
 * Creator Studio API service
 */
import { apiClient } from './client';
import type {
  CreatorAnalytics,
  AnalyticsTrend,
  VideoPerformanceData,
  CreatorSettings,
  VirtualGift,
  GiftTransaction,
  CoinPackage,
  CoinBalance,
  CreatorSubscription,
  CreatorSubscriptionSettings,
  PayoutRequest,
  PayoutSettings,
  CreatorVideo,
  TopSupporter,
} from '@/types/creator';

export const creatorApi = {
  // ========== Analytics ==========

  /**
   * Get creator analytics overview
   */
  async getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<CreatorAnalytics> {
    const { data } = await apiClient.get<CreatorAnalytics>('/creator/analytics', {
      params: { period },
    });
    return data;
  },

  /**
   * Get analytics trend data
   */
  async getAnalyticsTrends(
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<AnalyticsTrend[]> {
    const { data } = await apiClient.get<{ trends: AnalyticsTrend[] }>('/creator/analytics/trends', {
      params: { period },
    });
    return data.trends;
  },

  /**
   * Get video performance data
   */
  async getVideoPerformance(
    page = 1,
    limit = 20,
    sortBy: 'views' | 'likes' | 'recent' = 'recent'
  ): Promise<{ videos: VideoPerformanceData[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ videos: VideoPerformanceData[]; hasMore: boolean }>(
      '/creator/analytics/videos',
      { params: { page, limit, sortBy } }
    );
    return data;
  },

  /**
   * Get single video analytics
   */
  async getVideoAnalytics(videoId: string): Promise<VideoPerformanceData> {
    const { data } = await apiClient.get<{ video: VideoPerformanceData }>(
      `/creator/analytics/videos/${videoId}`
    );
    return data.video;
  },

  // ========== Creator Settings ==========

  /**
   * Get creator settings
   */
  async getCreatorSettings(): Promise<CreatorSettings> {
    const { data } = await apiClient.get<CreatorSettings>('/creator/settings');
    return data;
  },

  /**
   * Update creator settings
   */
  async updateCreatorSettings(settings: Partial<CreatorSettings>): Promise<CreatorSettings> {
    const { data } = await apiClient.patch<CreatorSettings>('/creator/settings', settings);
    return data;
  },

  /**
   * Apply for monetization
   */
  async applyForMonetization(): Promise<{ status: 'pending' | 'approved' | 'rejected' }> {
    const { data } = await apiClient.post<{ status: 'pending' | 'approved' | 'rejected' }>(
      '/creator/monetization/apply'
    );
    return data;
  },

  // ========== Gifts & Coins ==========

  /**
   * Get all available gifts
   */
  async getGifts(): Promise<VirtualGift[]> {
    const { data } = await apiClient.get<{ gifts: VirtualGift[] }>('/gifts');
    return data.gifts;
  },

  /**
   * Get gift history (received)
   */
  async getReceivedGifts(
    page = 1,
    limit = 20
  ): Promise<{ gifts: GiftTransaction[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ gifts: GiftTransaction[]; hasMore: boolean }>(
      '/creator/gifts/received',
      { params: { page, limit } }
    );
    return data;
  },

  /**
   * Get gift history (sent)
   */
  async getSentGifts(
    page = 1,
    limit = 20
  ): Promise<{ gifts: GiftTransaction[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ gifts: GiftTransaction[]; hasMore: boolean }>(
      '/gifts/sent',
      { params: { page, limit } }
    );
    return data;
  },

  /**
   * Send a gift
   */
  async sendGift(
    recipientId: string,
    giftId: string,
    options?: {
      videoId?: string;
      liveStreamId?: string;
      message?: string;
      count?: number;
    }
  ): Promise<{ success: boolean; coinsSpent: number; newBalance: number }> {
    const { data } = await apiClient.post<{
      success: boolean;
      coinsSpent: number;
      newBalance: number;
    }>('/gifts/send', {
      recipientId,
      giftId,
      ...options,
    });
    return data;
  },

  /**
   * Get coin packages
   */
  async getCoinPackages(): Promise<CoinPackage[]> {
    const { data } = await apiClient.get<{ packages: CoinPackage[] }>('/coins/packages');
    return data.packages;
  },

  /**
   * Get coin balance
   */
  async getCoinBalance(): Promise<CoinBalance> {
    const { data } = await apiClient.get<CoinBalance>('/coins/balance');
    return data;
  },

  /**
   * Purchase coins
   */
  async purchaseCoins(packageId: string): Promise<{ checkoutUrl: string }> {
    const { data } = await apiClient.post<{ checkoutUrl: string }>('/coins/purchase', {
      packageId,
    });
    return data;
  },

  // ========== Subscriptions ==========

  /**
   * Get subscription settings
   */
  async getSubscriptionSettings(): Promise<CreatorSubscriptionSettings> {
    const { data } = await apiClient.get<CreatorSubscriptionSettings>(
      '/creator/subscriptions/settings'
    );
    return data;
  },

  /**
   * Update subscription settings
   */
  async updateSubscriptionSettings(
    settings: Partial<CreatorSubscriptionSettings>
  ): Promise<CreatorSubscriptionSettings> {
    const { data } = await apiClient.patch<CreatorSubscriptionSettings>(
      '/creator/subscriptions/settings',
      settings
    );
    return data;
  },

  /**
   * Get my subscribers
   */
  async getSubscribers(
    page = 1,
    limit = 20
  ): Promise<{ subscribers: CreatorSubscription[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{
      subscribers: CreatorSubscription[];
      hasMore: boolean;
    }>('/creator/subscribers', { params: { page, limit } });
    return data;
  },

  /**
   * Get my subscriptions (as subscriber)
   */
  async getMySubscriptions(): Promise<CreatorSubscription[]> {
    const { data } = await apiClient.get<{ subscriptions: CreatorSubscription[] }>(
      '/subscriptions/my'
    );
    return data.subscriptions;
  },

  /**
   * Subscribe to a creator
   */
  async subscribe(
    creatorId: string,
    tierId: string
  ): Promise<{ checkoutUrl?: string; subscription?: CreatorSubscription }> {
    const { data } = await apiClient.post<{
      checkoutUrl?: string;
      subscription?: CreatorSubscription;
    }>(`/creators/${creatorId}/subscribe`, { tierId });
    return data;
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await apiClient.post(`/subscriptions/${subscriptionId}/cancel`);
  },

  // ========== Payouts ==========

  /**
   * Get payout settings
   */
  async getPayoutSettings(): Promise<PayoutSettings> {
    const { data } = await apiClient.get<PayoutSettings>('/creator/payouts/settings');
    return data;
  },

  /**
   * Update payout settings
   */
  async updatePayoutSettings(settings: Partial<PayoutSettings>): Promise<PayoutSettings> {
    const { data } = await apiClient.patch<PayoutSettings>(
      '/creator/payouts/settings',
      settings
    );
    return data;
  },

  /**
   * Get payout history
   */
  async getPayoutHistory(page = 1): Promise<{ payouts: PayoutRequest[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ payouts: PayoutRequest[]; hasMore: boolean }>(
      '/creator/payouts',
      { params: { page } }
    );
    return data;
  },

  /**
   * Request payout
   */
  async requestPayout(amount: number): Promise<PayoutRequest> {
    const { data } = await apiClient.post<{ payout: PayoutRequest }>('/creator/payouts/request', {
      amount,
    });
    return data.payout;
  },

  /**
   * Connect Stripe account
   */
  async connectStripe(): Promise<{ connectUrl: string }> {
    const { data } = await apiClient.post<{ connectUrl: string }>('/creator/payouts/stripe/connect');
    return data;
  },

  // ========== Content Management ==========

  /**
   * Get my videos
   */
  async getMyVideos(
    page = 1,
    limit = 20,
    status?: 'all' | 'published' | 'draft' | 'scheduled'
  ): Promise<{ videos: CreatorVideo[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ videos: CreatorVideo[]; hasMore: boolean }>(
      '/creator/videos',
      { params: { page, limit, status } }
    );
    return data;
  },

  /**
   * Update video
   */
  async updateVideo(
    videoId: string,
    updates: Partial<Pick<CreatorVideo, 'title' | 'description' | 'visibility' | 'thumbnailUrl'>>
  ): Promise<CreatorVideo> {
    const { data } = await apiClient.patch<{ video: CreatorVideo }>(
      `/creator/videos/${videoId}`,
      updates
    );
    return data.video;
  },

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<void> {
    await apiClient.delete(`/creator/videos/${videoId}`);
  },

  /**
   * Get top supporters
   */
  async getTopSupporters(limit = 10): Promise<TopSupporter[]> {
    const { data } = await apiClient.get<{ supporters: TopSupporter[] }>(
      '/creator/supporters/top',
      { params: { limit } }
    );
    return data.supporters;
  },
};

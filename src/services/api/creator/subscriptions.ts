import { apiClient } from '../client';
import type { CreatorSubscription, CreatorSubscriptionSettings, PayoutRequest, PayoutSettings, CreatorVideo, TopSupporter } from '@/types/creator';

export const subscriptionsApi = {
  async getSubscriptionSettings(): Promise<CreatorSubscriptionSettings> {
    const { data } = await apiClient.get<CreatorSubscriptionSettings>('/creator/subscriptions/settings');
    return data;
  },

  async updateSubscriptionSettings(settings: Partial<CreatorSubscriptionSettings>): Promise<CreatorSubscriptionSettings> {
    const { data } = await apiClient.patch<CreatorSubscriptionSettings>('/creator/subscriptions/settings', settings);
    return data;
  },

  async getSubscribers(page = 1, limit = 20): Promise<{ subscribers: CreatorSubscription[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ subscribers: CreatorSubscription[]; hasMore: boolean }>('/creator/subscribers', { params: { page, limit } });
    return data;
  },

  async getMySubscriptions(): Promise<CreatorSubscription[]> {
    const { data } = await apiClient.get<{ subscriptions: CreatorSubscription[] }>('/subscriptions/my');
    return data.subscriptions;
  },

  async subscribe(creatorId: string, tierId: string): Promise<{ checkoutUrl?: string; subscription?: CreatorSubscription }> {
    const { data } = await apiClient.post<{ checkoutUrl?: string; subscription?: CreatorSubscription }>(`/creators/${creatorId}/subscribe`, { tierId });
    return data;
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await apiClient.post(`/subscriptions/${subscriptionId}/cancel`);
  },

  async getPayoutSettings(): Promise<PayoutSettings> {
    const { data } = await apiClient.get<PayoutSettings>('/creator/payouts/settings');
    return data;
  },

  async updatePayoutSettings(settings: Partial<PayoutSettings>): Promise<PayoutSettings> {
    const { data } = await apiClient.patch<PayoutSettings>('/creator/payouts/settings', settings);
    return data;
  },

  async getPayoutHistory(page = 1): Promise<{ payouts: PayoutRequest[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ payouts: PayoutRequest[]; hasMore: boolean }>('/creator/payouts', { params: { page } });
    return data;
  },

  async requestPayout(amount: number): Promise<PayoutRequest> {
    const { data } = await apiClient.post<{ payout: PayoutRequest }>('/creator/payouts/request', { amount });
    return data.payout;
  },

  async connectStripe(): Promise<{ connectUrl: string }> {
    const { data } = await apiClient.post<{ connectUrl: string }>('/creator/payouts/stripe/connect');
    return data;
  },

  async getMyVideos(page = 1, limit = 20, status?: 'all' | 'published' | 'draft' | 'scheduled'): Promise<{ videos: CreatorVideo[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ videos: CreatorVideo[]; hasMore: boolean }>('/creator/videos', { params: { page, limit, status } });
    return data;
  },

  async updateVideo(videoId: string, updates: Partial<Pick<CreatorVideo, 'title' | 'description' | 'visibility' | 'thumbnailUrl'>>): Promise<CreatorVideo> {
    const { data } = await apiClient.patch<{ video: CreatorVideo }>(`/creator/videos/${videoId}`, updates);
    return data.video;
  },

  async deleteVideo(videoId: string): Promise<void> {
    await apiClient.delete(`/creator/videos/${videoId}`);
  },

  async getTopSupporters(limit = 10): Promise<TopSupporter[]> {
    const { data } = await apiClient.get<{ supporters: TopSupporter[] }>('/creator/supporters/top', { params: { limit } });
    return data.supporters;
  },
};

import { apiClient } from '../client';
import type { VirtualGift, GiftTransaction, CoinPackage, CoinBalance } from '@/types/creator';

export const giftsApi = {
  async getGifts(): Promise<VirtualGift[]> {
    const { data } = await apiClient.get<{ gifts: VirtualGift[] }>('/gifts');
    return data.gifts;
  },

  async getReceivedGifts(page = 1, limit = 20): Promise<{ gifts: GiftTransaction[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ gifts: GiftTransaction[]; hasMore: boolean }>('/creator/gifts/received', { params: { page, limit } });
    return data;
  },

  async getSentGifts(page = 1, limit = 20): Promise<{ gifts: GiftTransaction[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ gifts: GiftTransaction[]; hasMore: boolean }>('/gifts/sent', { params: { page, limit } });
    return data;
  },

  async sendGift(recipientId: string, giftId: string, options?: { videoId?: string; liveStreamId?: string; message?: string; count?: number }): Promise<{ success: boolean; coinsSpent: number; newBalance: number }> {
    const { data } = await apiClient.post<{ success: boolean; coinsSpent: number; newBalance: number }>('/gifts/send', { recipientId, giftId, ...options });
    return data;
  },

  async getCoinPackages(): Promise<CoinPackage[]> {
    const { data } = await apiClient.get<{ packages: CoinPackage[] }>('/coins/packages');
    return data.packages;
  },

  async getCoinBalance(): Promise<CoinBalance> {
    const { data } = await apiClient.get<CoinBalance>('/coins/balance');
    return data;
  },

  async purchaseCoins(packageId: string): Promise<{ checkoutUrl: string }> {
    const { data } = await apiClient.post<{ checkoutUrl: string }>('/coins/purchase', { packageId });
    return data;
  },
};

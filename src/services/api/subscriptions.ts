/**
 * Subscriptions API service
 * Handles creator subscription operations
 */

import { apiClient } from './client';
import type { SubscriptionTier } from '@/types/creator';

export interface CreatorTiersResponse {
  creatorId: string;
  creatorName: string;
  tiers: SubscriptionTier[];
  isSubscribed: boolean;
  currentTier?: SubscriptionTier;
}

export interface SubscriptionCheckResponse {
  isSubscribed: boolean;
  tier?: SubscriptionTier;
  expiresAt?: string;
}

export interface UserSubscription {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorAvatar?: string;
  tier: SubscriptionTier;
  price: number;
  status: 'active' | 'cancelled' | 'expired';
  startedAt: string;
  expiresAt: string;
  renewsAt?: string;
}

export const subscriptionsApi = {
  /**
   * Check if current user is subscribed to a creator
   */
  async isSubscribedTo(creatorId: string): Promise<SubscriptionCheckResponse> {
    try {
      const { data } = await apiClient.get<SubscriptionCheckResponse>(
        `/subscriptions/check/${creatorId}`
      );
      return data;
    } catch (error) {
      return { isSubscribed: false };
    }
  },

  /**
   * Get subscription tiers for a creator
   */
  async getCreatorTiers(creatorId: string): Promise<CreatorTiersResponse | null> {
    try {
      const { data } = await apiClient.get<CreatorTiersResponse>(
        `/subscriptions/tiers/${creatorId}`
      );
      return data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Subscribe to a creator at a specific tier
   * Returns checkout URL for Stripe payment
   */
  async subscribe(
    creatorId: string,
    tierId: string
  ): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
    try {
      const { data } = await apiClient.post<{ checkoutUrl: string }>(
        `/subscriptions/subscribe`,
        { creatorId, tierId }
      );
      return { success: true, checkoutUrl: data.checkoutUrl };
    } catch (error: unknown) {
      console.error('Failed to subscribe:', error);
      const message = error instanceof Error ? error.message : 'Failed to subscribe';
      return { success: false, error: message };
    }
  },

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      await apiClient.post(`/subscriptions/cancel`, { subscriptionId });
      return true;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  },

  /**
   * Get user's active subscriptions
   */
  async getMySubscriptions(): Promise<UserSubscription[]> {
    try {
      const { data } = await apiClient.get<{ subscriptions: UserSubscription[] }>(
        `/subscriptions/my-subscriptions`
      );
      return data.subscriptions || [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Enable subscriptions for the current creator with tiers
   */
  async enableSubscriptions(tiers: Array<{ name: string; price: number; benefits: string[] }>): Promise<boolean> {
    try {
      await apiClient.post('/subscriptions/enable', { tiers });
      return true;
    } catch (error) {
      console.error('Failed to enable subscriptions:', error);
      return false;
    }
  },

  /**
   * Disable subscriptions for the current creator
   */
  async disableSubscriptions(): Promise<boolean> {
    try {
      await apiClient.post('/subscriptions/disable');
      return true;
    } catch (error) {
      console.error('Failed to disable subscriptions:', error);
      return false;
    }
  },

  /**
   * Get creator's subscribers
   */
  async getMySubscribers(offset = 0, limit = 20): Promise<{ subscriptions: unknown[]; total: number }> {
    try {
      const { data } = await apiClient.get<{ subscriptions: unknown[]; total: number }>(
        '/subscriptions/my-subscribers',
        { params: { offset, limit } }
      );
      return data;
    } catch (error) {
      return { subscriptions: [], total: 0 };
    }
  },
};

/**
 * Creator Settings API
 * Handles monetization settings and Stripe Connect integration
 */
import { apiClient } from './client';

export interface CreatorMonetizationSettings {
  giftsEnabled: boolean;
  tipsEnabled: boolean;
  subscriptionsEnabled: boolean;
  payoutMethod: 'stripe' | 'paypal' | 'bank';
  minimumPayout: number;
}

export interface StripeConnectStatus {
  accountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export const creatorSettingsApi = {
  /**
   * Get creator monetization settings
   * Uses user preferences endpoint for flexible storage
   */
  async getSettings(): Promise<CreatorMonetizationSettings> {
    try {
      const { data } = await apiClient.get<{ preferences?: { creatorSettings?: CreatorMonetizationSettings } }>('/user/preferences');
      return data.preferences?.creatorSettings || {
        giftsEnabled: true,
        tipsEnabled: false,
        subscriptionsEnabled: false,
        payoutMethod: 'stripe',
        minimumPayout: 50,
      };
    } catch {
      // Return defaults if not found
      return {
        giftsEnabled: true,
        tipsEnabled: false,
        subscriptionsEnabled: false,
        payoutMethod: 'stripe',
        minimumPayout: 50,
      };
    }
  },

  /**
   * Update creator monetization settings
   */
  async updateSettings(settings: Partial<CreatorMonetizationSettings>): Promise<CreatorMonetizationSettings> {
    // Get current settings first
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    // Save to user preferences
    await apiClient.put('/user/preferences', {
      preferences: { creatorSettings: updated }
    });

    // If subscriptions changed, also update the user flag
    if (settings.subscriptionsEnabled !== undefined) {
      try {
        if (settings.subscriptionsEnabled) {
          await apiClient.post('/subscriptions/enable');
        } else {
          await apiClient.post('/subscriptions/disable');
        }
      } catch (e) {
        console.warn('Failed to sync subscription status:', e);
      }
    }

    return updated;
  },

  /**
   * Get Stripe Connect status
   */
  async getStripeStatus(): Promise<StripeConnectStatus | null> {
    try {
      const { data } = await apiClient.get<StripeConnectStatus>('/connect/status');
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Create Stripe Connect account (or get existing)
   */
  async createStripeAccount(): Promise<StripeConnectStatus> {
    const { data } = await apiClient.post<StripeConnectStatus>('/connect/create-account');
    return data;
  },

  /**
   * Get Stripe onboarding link
   */
  async getStripeOnboardingLink(returnUrl: string, refreshUrl: string): Promise<string> {
    const { data } = await apiClient.post<{ url: string }>('/connect/onboarding-link', {
      returnUrl,
      refreshUrl,
    });
    return data.url;
  },
};

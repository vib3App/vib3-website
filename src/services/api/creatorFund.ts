/**
 * Creator Fund API service
 */
import { apiClient } from './client';
import type {
  TierInfo,
  EligibilityResponse,
  CreatorFundMembership,
  EarningPeriod,
  EarningsSummary,
  DashboardData,
  WithdrawalResponse,
  CreatorPaymentMethod,
} from '@/types/creatorFund';

export const creatorFundApi = {
  /**
   * Get tier information
   */
  async getTiers(): Promise<TierInfo[]> {
    const { data } = await apiClient.get<{ tiers: TierInfo[] }>('/creator-fund/tiers');
    return data.tiers;
  },

  /**
   * Get eligibility requirements
   */
  async getRequirements(): Promise<{ requirements: Record<string, number | boolean> }> {
    const { data } = await apiClient.get<{ requirements: Record<string, number | boolean> }>(
      '/creator-fund/requirements'
    );
    return data;
  },

  /**
   * Check user's eligibility
   */
  async checkEligibility(): Promise<EligibilityResponse> {
    const { data } = await apiClient.get<EligibilityResponse>('/creator-fund/eligibility');
    return data;
  },

  /**
   * Get user's membership
   */
  async getMembership(): Promise<{ isEnrolled: boolean; membership: CreatorFundMembership | null }> {
    const { data } = await apiClient.get<{ isEnrolled: boolean; membership: CreatorFundMembership | null }>(
      '/creator-fund/membership'
    );
    return data;
  },

  /**
   * Apply to creator fund
   */
  async apply(): Promise<{ success: boolean; membership: CreatorFundMembership }> {
    const { data } = await apiClient.post<{ success: boolean; membership: CreatorFundMembership }>(
      '/creator-fund/apply'
    );
    return data;
  },

  /**
   * Get earnings history
   */
  async getEarnings(limit = 12): Promise<{ earnings: EarningPeriod[]; summary: EarningsSummary }> {
    const { data } = await apiClient.get<{ earnings: EarningPeriod[]; summary: EarningsSummary }>(
      '/creator-fund/earnings',
      { params: { limit } }
    );
    return data;
  },

  /**
   * Get current period earnings
   */
  async getCurrentEarnings(): Promise<{ earning: EarningPeriod | null; message?: string }> {
    const { data } = await apiClient.get<{ earning: EarningPeriod | null; message?: string }>(
      '/creator-fund/earnings/current'
    );
    return data;
  },

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    type: 'paypal' | 'bank',
    details: { email?: string; accountLast4?: string }
  ): Promise<{ success: boolean; paymentMethod: CreatorPaymentMethod }> {
    const { data } = await apiClient.post<{ success: boolean; paymentMethod: CreatorPaymentMethod }>(
      '/creator-fund/payment-method',
      { type, ...details }
    );
    return data;
  },

  /**
   * Request withdrawal
   */
  async withdraw(amount: number): Promise<WithdrawalResponse> {
    const { data } = await apiClient.post<WithdrawalResponse>('/creator-fund/withdraw', { amount });
    return data;
  },

  /**
   * Get dashboard data (all-in-one)
   */
  async getDashboard(): Promise<DashboardData> {
    const { data } = await apiClient.get<DashboardData>('/creator-fund/dashboard');
    return data;
  },
};

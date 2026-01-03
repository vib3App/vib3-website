/**
 * Wallet/Coins API service
 */
import { apiClient } from './client';
import type {
  Wallet,
  WalletCoinPackage,
  Transaction,
  SpendCoinsInput,
  SpendCoinsResponse,
  PurchaseCoinsInput,
  PurchaseCoinsResponse,
} from '@/types/wallet';

export const walletApi = {
  /**
   * Get current wallet balance
   */
  async getWallet(): Promise<Wallet> {
    const { data } = await apiClient.get<Wallet>('/wallet');
    return data;
  },

  /**
   * Get available coin packages
   */
  async getPackages(): Promise<WalletCoinPackage[]> {
    const { data } = await apiClient.get<{ packages: WalletCoinPackage[] }>('/wallet/packages');
    return data.packages;
  },

  /**
   * Get transaction history
   */
  async getTransactions(limit = 50, skip = 0): Promise<Transaction[]> {
    const { data } = await apiClient.get<{ transactions: Transaction[] }>('/wallet/transactions', {
      params: { limit, skip },
    });
    return data.transactions;
  },

  /**
   * Purchase coins (after IAP verification)
   */
  async purchase(input: PurchaseCoinsInput): Promise<PurchaseCoinsResponse> {
    const { data } = await apiClient.post<PurchaseCoinsResponse>('/wallet/purchase', input);
    return data;
  },

  /**
   * Spend coins (for gifts, etc.)
   */
  async spend(input: SpendCoinsInput): Promise<SpendCoinsResponse> {
    const { data } = await apiClient.post<SpendCoinsResponse>('/wallet/spend', input);
    return data;
  },

  /**
   * Send coins as gift to another user
   */
  async sendGift(recipientId: string, amount: number, message?: string): Promise<SpendCoinsResponse> {
    return this.spend({
      amount,
      type: 'gift',
      recipientId,
      description: message || `Gift of ${amount} coins`,
    });
  },

  /**
   * Get creator balance (for payouts)
   */
  async getBalance(): Promise<{ balance: number; pendingBalance: number }> {
    try {
      const { data } = await apiClient.get<{ balance: number; pendingBalance: number }>('/wallet/balance');
      return data;
    } catch {
      return { balance: 0, pendingBalance: 0 };
    }
  },

  /**
   * Get payout methods
   */
  async getPayoutMethods(): Promise<Array<{ id: string; type: string; name: string; lastFour?: string; isDefault: boolean }>> {
    try {
      const { data } = await apiClient.get<{ methods: Array<{ id: string; type: string; name: string; lastFour?: string; isDefault: boolean }> }>('/wallet/payout-methods');
      return data.methods ?? [];
    } catch {
      return [];
    }
  },

  /**
   * Get payout history
   */
  async getPayoutHistory(): Promise<Array<{ id: string; amount: number; status: string; method: string; createdAt: string; completedAt?: string }>> {
    try {
      const { data } = await apiClient.get<{ payouts: Array<{ id: string; amount: number; status: string; method: string; createdAt: string; completedAt?: string }> }>('/wallet/payouts');
      return data.payouts ?? [];
    } catch {
      return [];
    }
  },

  /**
   * Request a payout
   */
  async requestPayout(amount: number, methodId: string): Promise<{ success: boolean; payoutId?: string }> {
    const { data } = await apiClient.post<{ success: boolean; payoutId?: string }>('/wallet/payouts', {
      amount,
      methodId,
    });
    return data;
  },
};

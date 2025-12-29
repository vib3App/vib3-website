/**
 * Payment API service - Stripe integration for web coin purchases
 */
import { apiClient } from './client';

export interface CoinPackage {
  id: string;
  coins: number;
  bonus: number;
  price: number;
  currency: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const paymentApi = {
  /**
   * Get available coin packages from payment service
   */
  async getPackages(): Promise<CoinPackage[]> {
    const { data } = await apiClient.get<{ packages: CoinPackage[] }>('/payments/packages');
    return data.packages;
  },

  /**
   * Create a Stripe Checkout session for coin purchase
   * Returns a URL to redirect the user to Stripe's hosted checkout page
   */
  async createCheckoutSession(packageId: string): Promise<CheckoutSessionResponse> {
    const successUrl = `${window.location.origin}/coins?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/coins?canceled=true`;

    const { data } = await apiClient.post<CheckoutSessionResponse>('/payments/create-checkout', {
      packageId,
      successUrl,
      cancelUrl,
    });
    return data;
  },

  /**
   * Create a Payment Intent for custom Stripe Elements integration
   * (Alternative to checkout session)
   */
  async createPaymentIntent(amount: number, currency = 'usd'): Promise<PaymentIntentResponse> {
    const { data } = await apiClient.post<PaymentIntentResponse>('/payments/create-intent', {
      amount,
      currency,
    });
    return data;
  },

  /**
   * Confirm a payment after it's been processed
   */
  async confirmPayment(paymentIntentId: string): Promise<{ success: boolean; coinsAdded: number; newBalance: number }> {
    const { data } = await apiClient.post<{ success: boolean; coinsAdded: number; newBalance: number }>(
      '/payments/confirm',
      { paymentIntentId }
    );
    return data;
  },

  /**
   * Get user's current coin balance
   */
  async getCoinBalance(): Promise<{ coins: number; totalPurchased: number; totalSpent: number }> {
    const { data } = await apiClient.get<{ coins: number; totalPurchased: number; totalSpent: number }>(
      '/payments/coins'
    );
    return data;
  },
};

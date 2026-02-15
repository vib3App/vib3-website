/**
 * Wallet/Coins types - Virtual currency system
 */

export interface Wallet {
  coins: number;
  totalPurchased: number;
  totalSpent: number;
}

export interface WalletCoinPackage {
  id: string;
  coins: number;
  price: number;
  bonus: number;
}

type TransactionType =
  | 'purchase'
  | 'spend'
  | 'gift'
  | 'gift_received'
  | 'earned'
  | 'bonus'
  | 'refund';

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  packageId?: string;
  price?: number;
  platform?: string;
  recipientId?: string;
  senderId?: string;
  senderUsername?: string;
  recipientUsername?: string;
  description: string;
  createdAt: string;
}

export interface SpendCoinsInput {
  amount: number;
  type?: 'spend' | 'gift';
  recipientId?: string;
  description?: string;
}

export interface SpendCoinsResponse {
  success: boolean;
  coins: number;
  spent: number;
}

export interface PurchaseCoinsInput {
  packageId: string;
  receipt: string;
  platform: 'ios' | 'android' | 'web';
}

export interface PurchaseCoinsResponse {
  success: boolean;
  coins: number;
  added: number;
}

/**
 * Creator Fund types - Earnings program for creators
 */

export type CreatorFundTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'rejected' | 'withdrawn';

export type EarningStatus = 'calculating' | 'pending' | 'approved' | 'paid' | 'disputed' | 'cancelled';

export interface TierInfo {
  id: string;
  name: string;
  minFollowers: number;
  payoutPer1kViews: number;
  payoutDisplay: string;
  isCurrent?: boolean;
}

export interface EligibilityRequirement {
  id: string;
  label: string;
  met: boolean;
  current: number | boolean;
  currentDisplay: string;
}

export interface EligibilityResponse {
  isEligible: boolean;
  requirements: EligibilityRequirement[];
  potentialTier: CreatorFundTier | null;
  stats: {
    followers: number;
    monthlyViews: number;
    videosLast30Days: number;
  };
}

export interface CreatorPaymentMethod {
  type: 'paypal' | 'bank';
  display: string;
}

export interface CreatorFundMembership {
  _id: string;
  status: MembershipStatus;
  tier: CreatorFundTier;
  tierInfo: {
    name: string;
    minFollowers: number;
    payoutPer1kViews: number;
  };
  potentialTier: CreatorFundTier | null;
  appliedAt: string;
  approvedAt?: string;
  lifetimeStats: {
    totalEarnings: number;
    totalViews: number;
    totalPayouts: number;
  };
  paymentMethod: CreatorPaymentMethod | null;
}

export interface EarningPeriod {
  _id?: string;
  period: {
    year: number;
    month: number;
  };
  periodDisplay: string;
  tier: CreatorFundTier;
  views: number;
  earnings: number;
  status: EarningStatus;
  paidAt?: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  availableBalance: number;
  totalViews: number;
}

export interface DashboardData {
  isEnrolled: boolean;
  membership: {
    tier: CreatorFundTier;
    tierInfo: TierInfo;
    potentialTier: CreatorFundTier | null;
    potentialTierInfo: TierInfo | null;
    paymentMethod: CreatorPaymentMethod | null;
  } | null;
  balances: {
    totalEarnings: number;
    pendingBalance: number;
    availableBalance: number;
    paidOut: number;
  };
  recentEarnings: {
    period: string;
    views: number;
    earnings: number;
    status: EarningStatus;
  }[];
  tiers: TierInfo[];
}

export interface WithdrawalResponse {
  success: boolean;
  withdrawal: {
    _id: string;
    amount: number;
    status: string;
    estimatedProcessing: string;
  };
}

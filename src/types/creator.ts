/**
 * Creator Studio and Monetization types
 */

// ========== Analytics ==========

export interface CreatorAnalytics {
  overview: AnalyticsOverview;
  videoPerformance: VideoPerformanceData[];
  audienceInsights: AudienceInsights;
  revenueBreakdown: RevenueBreakdown;
}

interface AnalyticsOverview {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollowers: number;
  followerGrowth: number;
  engagementRate: number;
  averageWatchTime: number;
  totalRevenue: number;
}

export interface AnalyticsTrend {
  date: string;
  views: number;
  likes: number;
  followers: number;
  revenue: number;
}

export interface VideoPerformanceData {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  averageWatchTime: number;
  completionRate: number;
  publishedAt: string;
}

export interface AudienceInsights {
  demographics: {
    ageGroups: Array<{ range: string; percentage: number }>;
    genders: Array<{ gender: string; percentage: number }>;
    countries: Array<{ country: string; percentage: number }>;
  };
  activeHours: Array<{ hour: number; percentage: number }>;
  activeDays: Array<{ day: string; percentage: number }>;
  topInterests: string[];
}

interface RevenueBreakdown {
  total: number;
  gifts: number;
  subscriptions: number;
  tips: number;
  pending: number;
  lastPayout: number;
  lastPayoutDate?: string;
}

// ========== Creator Settings ==========

export interface CreatorSettings {
  isMonetized: boolean;
  monetizationTier: 'starter' | 'partner' | 'premium';
  giftingEnabled: boolean;
  subscriptionsEnabled: boolean;
  tipsEnabled: boolean;
  subscriptionPrice?: number;
  payoutMethod?: 'stripe' | 'paypal' | 'bank';
  payoutThreshold: number;
  autoPayoutEnabled: boolean;
}

// ========== Gifts & Virtual Economy ==========

export interface VirtualGift {
  id: string;
  name: string;
  iconUrl: string;
  animationUrl?: string;
  coinValue: number;
  category: 'basic' | 'premium' | 'exclusive';
  isAnimated: boolean;
}

export interface GiftTransaction {
  id: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  receiverId: string;
  videoId?: string;
  liveStreamId?: string;
  coinValue: number;
  message?: string;
  createdAt: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  bonusCoins: number;
  price: number;
  currency: string;
  popular?: boolean;
}

export interface CoinBalance {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalSpent: number;
}

// ========== Subscriptions ==========

export interface CreatorSubscription {
  id: string;
  creatorId: string;
  subscriberId: string;
  subscriberUsername: string;
  subscriberAvatar?: string;
  tier: SubscriptionTier;
  price: number;
  status: 'active' | 'cancelled' | 'expired';
  startedAt: string;
  expiresAt: string;
  renewsAt?: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  badge?: string;
  color?: string;
}

export interface CreatorSubscriptionSettings {
  enabled: boolean;
  tiers: SubscriptionTier[];
  welcomeMessage?: string;
  subscriberOnlyContent: boolean;
}

// ========== Payouts ==========

export interface PayoutRequest {
  id: string;
  amount: number;
  currency: string;
  method: 'stripe' | 'paypal' | 'bank';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  transactionId?: string;
  failureReason?: string;
}

export interface PayoutSettings {
  method: 'stripe' | 'paypal' | 'bank';
  minimumPayout: number;
  autoPayoutEnabled: boolean;
  autoPayoutThreshold: number;
  stripeAccountId?: string;
  paypalEmail?: string;
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
}

// ========== Content Management ==========

export interface CreatorVideo {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  status: 'draft' | 'processing' | 'published' | 'unlisted' | 'private' | 'deleted';
  visibility: 'public' | 'followers' | 'subscribers' | 'private';
  views: number;
  likes: number;
  comments: number;
  shares: number;
  duration: number;
  scheduledFor?: string;
  publishedAt?: string;
  createdAt: string;
  analytics?: {
    impressions: number;
    clickThroughRate: number;
    averageWatchTime: number;
    completionRate: number;
  };
}

// ========== Top Supporters ==========

export interface TopSupporter {
  userId: string;
  username: string;
  avatar?: string;
  totalGifts: number;
  totalCoins: number;
  subscriptionMonths?: number;
  rank: number;
}

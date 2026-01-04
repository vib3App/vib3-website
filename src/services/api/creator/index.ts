import { analyticsApi } from './analytics';
import { giftsApi } from './gifts';
import { subscriptionsApi } from './subscriptions';

export const creatorApi = {
  // Analytics
  getAnalytics: analyticsApi.getAnalytics,
  getAnalyticsTrends: analyticsApi.getAnalyticsTrends,
  getVideoPerformance: analyticsApi.getVideoPerformance,
  getVideoAnalytics: analyticsApi.getVideoAnalytics,
  getCreatorSettings: analyticsApi.getCreatorSettings,
  updateCreatorSettings: analyticsApi.updateCreatorSettings,
  applyForMonetization: analyticsApi.applyForMonetization,

  // Gifts & Coins
  getGifts: giftsApi.getGifts,
  getReceivedGifts: giftsApi.getReceivedGifts,
  getSentGifts: giftsApi.getSentGifts,
  sendGift: giftsApi.sendGift,
  getCoinPackages: giftsApi.getCoinPackages,
  getCoinBalance: giftsApi.getCoinBalance,
  purchaseCoins: giftsApi.purchaseCoins,

  // Subscriptions & Payouts
  getSubscriptionSettings: subscriptionsApi.getSubscriptionSettings,
  updateSubscriptionSettings: subscriptionsApi.updateSubscriptionSettings,
  getSubscribers: subscriptionsApi.getSubscribers,
  getMySubscriptions: subscriptionsApi.getMySubscriptions,
  subscribe: subscriptionsApi.subscribe,
  cancelSubscription: subscriptionsApi.cancelSubscription,
  getPayoutSettings: subscriptionsApi.getPayoutSettings,
  updatePayoutSettings: subscriptionsApi.updatePayoutSettings,
  getPayoutHistory: subscriptionsApi.getPayoutHistory,
  requestPayout: subscriptionsApi.requestPayout,
  connectStripe: subscriptionsApi.connectStripe,

  // Content
  getMyVideos: subscriptionsApi.getMyVideos,
  updateVideo: subscriptionsApi.updateVideo,
  deleteVideo: subscriptionsApi.deleteVideo,
  getTopSupporters: subscriptionsApi.getTopSupporters,
};

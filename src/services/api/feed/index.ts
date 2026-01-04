import { feedsApi } from './feeds';

export const feedApi = {
  getForYouFeed: feedsApi.getForYouFeed,
  getFollowingFeed: feedsApi.getFollowingFeed,
  getTrendingFeed: feedsApi.getTrendingFeed,
  getDiscoverFeed: feedsApi.getDiscoverFeed,
  getFriendsFeed: feedsApi.getFriendsFeed,
  getSelfFeed: feedsApi.getSelfFeed,
  getCategoryFeed: feedsApi.getCategoryFeed,
  getUserVideos: feedsApi.getUserVideos,
  getHashtagFeed: feedsApi.getHashtagFeed,
  getVibesFeed: feedsApi.getVibesFeed.bind(feedsApi),
  searchVideos: feedsApi.searchVideos,
  getFeed: feedsApi.getFeed.bind(feedsApi),
  getFeedByCategory: feedsApi.getFeedByCategory.bind(feedsApi),
};

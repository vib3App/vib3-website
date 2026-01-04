import { profileApi } from './profile';
import { followApi } from './follow';
import { userVideosApi } from './videos';
import { socialApi } from './social';

export const userApi = {
  // Profile
  getProfile: profileApi.getProfile,
  getMyProfile: profileApi.getMyProfile,
  updateProfile: profileApi.updateProfile,
  uploadProfilePicture: profileApi.uploadProfilePicture,

  // Follow
  followUser: followApi.followUser.bind(followApi),
  unfollowUser: followApi.unfollowUser.bind(followApi),
  toggleFollow: followApi.toggleFollow.bind(followApi),
  getFollowedUsers: followApi.getFollowedUsers.bind(followApi),
  isFollowing: followApi.isFollowing.bind(followApi),
  getFollowers: followApi.getFollowers,
  getFollowing: followApi.getFollowing.bind(followApi),

  // Videos
  getUserVideos: userVideosApi.getUserVideos,
  getMyVideos: userVideosApi.getMyVideos,
  getLikedVideos: userVideosApi.getLikedVideos,
  getTaggedVideos: userVideosApi.getTaggedVideos,

  // Social
  searchUsers: socialApi.searchUsers,
  getFriends: socialApi.getFriends,
  blockUser: socialApi.blockUser,
  unblockUser: socialApi.unblockUser,
  reportUser: socialApi.reportUser,
  getBlockedUsers: socialApi.getBlockedUsers,
};

export type { UserProfile, UserVideosResponse, BlockedUser, Friend } from './types';

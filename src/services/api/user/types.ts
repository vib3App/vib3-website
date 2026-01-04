import type { Video } from '@/types';

export interface UserProfile {
  _id: string;
  username: string;
  displayName?: string;
  email?: string;
  profilePicture?: string;
  profileImage?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt?: string;
  followers?: number;
  following?: number;
  followersCount?: number;
  followingCount?: number;
  totalLikes?: number;
  videoCount?: number;
  stats: {
    followers: number;
    following: number;
    likes: number;
    videos: number;
  };
}

export interface UserVideosResponse {
  videos: Video[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface BackendVideo {
  _id?: string;
  id?: string;
  userId?: string;
  author?: {
    _id?: string;
    username?: string;
    displayName?: string;
    profileImage?: string;
  };
  media?: Array<{
    url?: string;
    thumbnailUrl?: string;
  }>;
  caption?: string;
  title?: string;
  description?: string;
  duration?: number;
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  sharesCount?: number;
  hashtags?: string[];
  tags?: string[];
  createdAt?: string;
  isLiked?: boolean;
}

export interface BlockedUser {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  blockedAt: string;
}

export interface Friend {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
}

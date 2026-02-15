import type { Video, PaginatedResponse } from '@/types';

export type FeedType = 'forYou' | 'following' | 'friends' | 'trending' | 'discover' | 'self';
export type VibeType = 'Energetic' | 'Chill' | 'Creative' | 'Social' | 'Romantic' | 'Funny' | 'Inspirational';

export interface FeedVideoResponse {
  _id: string;
  userId?: string;
  username?: string;
  profilePicture?: string;
  videoUrl: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  duration: number;
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  sharesCount?: number;
  savesCount?: number;
  likes?: number;
  comments?: number;
  views?: number;
  shares?: number;
  saves?: number;
  isPublic?: boolean;
  createdAt: string;
  // User interaction state - returned by backend for authenticated users
  isLiked?: boolean;
  isFavorited?: boolean;
  hasCommented?: boolean;
  hasShared?: boolean;
  isFollowing?: boolean;
  user?: {
    _id: string;
    username: string;
    displayName?: string;
    profileImage?: string;
    profilePicture?: string;
  };
}

export interface FeedResponse {
  videos: FeedVideoResponse[];
  page: number;
  hasMore: boolean;
  total?: number;
}

export function transformFeedResponse(data: FeedResponse): PaginatedResponse<Video> {
  const videos = data?.videos || [];
  return {
    items: videos.map(transformVideo),
    page: data?.page || 1,
    hasMore: data?.hasMore ?? false,
    total: data?.total,
  };
}

export function transformVideo(data: FeedVideoResponse): Video {
  const userId = data.userId || data.user?._id || '';
  const username = data.username || data.user?.username || 'unknown';
  const userAvatar = data.profilePicture || data.user?.profileImage || data.user?.profilePicture;

  // Guard against null/undefined URLs that could cause fetch errors
  const videoUrl = data.hlsUrl || data.videoUrl || '';
  const thumbnailUrl = data.thumbnailUrl && data.thumbnailUrl !== 'null' ? data.thumbnailUrl : undefined;
  const safeUserAvatar = userAvatar && userAvatar !== 'null' ? userAvatar : undefined;

  return {
    id: data._id,
    userId,
    username,
    userAvatar: safeUserAvatar,
    videoUrl,
    thumbnailUrl,
    caption: data.caption || data.title || data.description || '',
    hashtags: data.hashtags || [],
    duration: data.duration,
    likesCount: data.likesCount || data.likes || 0,
    commentsCount: data.commentsCount || data.comments || 0,
    viewsCount: data.viewsCount || data.views || 0,
    sharesCount: data.sharesCount || data.shares || 0,
    savesCount: data.savesCount || data.saves || 0,
    isPublic: data.isPublic !== false,
    createdAt: data.createdAt,
    // User interaction state from backend
    isLiked: data.isLiked,
    isFavorited: data.isFavorited,
    hasCommented: data.hasCommented,
    hasShared: data.hasShared,
    isFollowing: data.isFollowing,
  };
}

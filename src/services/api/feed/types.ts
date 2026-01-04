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
  likes?: number;
  comments?: number;
  views?: number;
  shares?: number;
  isPublic?: boolean;
  createdAt: string;
  isLiked?: boolean;
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

  return {
    id: data._id,
    userId,
    username,
    userAvatar,
    videoUrl: data.hlsUrl || data.videoUrl,
    thumbnailUrl: data.thumbnailUrl,
    caption: data.caption || data.title || data.description || '',
    hashtags: data.hashtags || [],
    duration: data.duration,
    likesCount: data.likesCount || data.likes || 0,
    commentsCount: data.commentsCount || data.comments || 0,
    viewsCount: data.viewsCount || data.views || 0,
    sharesCount: data.sharesCount || data.shares || 0,
    isPublic: data.isPublic !== false,
    createdAt: data.createdAt,
    isLiked: data.isLiked,
  };
}

/**
 * Video API response types and transform functions.
 * Converts backend response shapes into front-end Video/Comment types.
 */
import type { Video, Comment } from '@/types';

export interface VideoResponse {
  _id: string;
  id?: string;
  userId?: string;
  author?: {
    _id?: string;
    username?: string;
    displayName?: string;
    profileImage?: string;
  };
  user?: {
    _id: string;
    username: string;
    displayName?: string;
    profileImage?: string;
    profilePicture?: string;
  };
  username?: string;
  profilePicture?: string;
  media?: Array<{
    url?: string;
    thumbnailUrl?: string;
  }>;
  videoUrl?: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  tags?: string[];
  duration?: number;
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  sharesCount?: number;
  savesCount?: number;
  // Alternative count field names from some backend responses
  likes?: number;
  comments?: number;
  views?: number;
  shares?: number;
  saves?: number;
  isPublic?: boolean;
  createdAt?: string;
  isLiked?: boolean;
  isFavorited?: boolean;
  hasCommented?: boolean;
  hasShared?: boolean;
  isFollowing?: boolean;
}

export interface CommentResponse {
  _id: string;
  userId: string;
  user?: {
    _id?: string;
    username?: string;
    profilePicture?: string;
    profileImage?: string;
  };
  username?: string;
  profilePicture?: string;
  content: string;
  text?: string;
  likesCount: number;
  replyCount?: number;
  createdAt: string;
  replies?: CommentResponse[];
  isLiked?: boolean;
  parentId?: string;
  voiceUrl?: string;
  voiceDuration?: number;
}

export function transformVideo(data: VideoResponse): Video {
  const username = data.author?.username || data.user?.username || data.username || 'Unknown';
  const rawAvatar = data.author?.profileImage || data.profilePicture || data.user?.profileImage || data.user?.profilePicture;
  const userAvatar = rawAvatar && rawAvatar !== 'null' ? rawAvatar : undefined;
  const userId = data.userId || data.author?._id || data.user?._id || '';

  const videoUrl = data.media?.[0]?.url || data.hlsUrl || data.videoUrl || '';
  const rawThumbnail = data.media?.[0]?.thumbnailUrl || data.thumbnailUrl;
  const thumbnailUrl = rawThumbnail && rawThumbnail !== 'null' ? rawThumbnail : undefined;

  return {
    id: data.id || data._id,
    userId,
    username,
    userAvatar,
    videoUrl,
    thumbnailUrl,
    caption: data.caption || data.title || data.description || '',
    hashtags: data.hashtags || data.tags || [],
    duration: data.duration || 0,
    likesCount: data.likesCount || data.likes || 0,
    commentsCount: data.commentsCount || data.comments || 0,
    viewsCount: data.viewsCount || data.views || 0,
    sharesCount: data.sharesCount || data.shares || 0,
    savesCount: data.savesCount || data.saves || 0,
    isPublic: data.isPublic !== false,
    createdAt: data.createdAt || new Date().toISOString(),
    isLiked: data.isLiked,
    isFavorited: data.isFavorited,
    hasCommented: data.hasCommented,
    hasShared: data.hasShared,
    isFollowing: data.isFollowing,
  };
}

export function transformComment(data: CommentResponse): Comment {
  const username = data.user?.username || data.username || 'Unknown';
  const userAvatar = data.user?.profilePicture || data.user?.profileImage || data.profilePicture;
  const userId = data.user?._id || data.userId;
  const content = data.content || data.text || '';

  return {
    id: data._id,
    userId,
    username,
    userAvatar,
    content,
    likesCount: data.likesCount || 0,
    replyCount: data.replyCount || 0,
    createdAt: data.createdAt,
    replies: data.replies?.map(transformComment),
    isLiked: data.isLiked,
    parentId: data.parentId,
    voiceUrl: data.voiceUrl,
    voiceDuration: data.voiceDuration,
  };
}

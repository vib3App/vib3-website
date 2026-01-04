import type { Video } from '@/types';

export interface VideoResponse {
  _id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  videoUrl: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  caption: string;
  hashtags: string[];
  duration: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  isPublic: boolean;
  createdAt: string;
}

export function transformVideo(data: VideoResponse): Video {
  return {
    id: data._id,
    userId: data.userId,
    username: data.username,
    userAvatar: data.profilePicture,
    videoUrl: data.hlsUrl || data.videoUrl,
    thumbnailUrl: data.thumbnailUrl,
    caption: data.caption,
    hashtags: data.hashtags || [],
    duration: data.duration,
    likesCount: data.likesCount || 0,
    commentsCount: data.commentsCount || 0,
    viewsCount: data.viewsCount || 0,
    sharesCount: data.sharesCount || 0,
    isPublic: data.isPublic,
    createdAt: data.createdAt,
  };
}

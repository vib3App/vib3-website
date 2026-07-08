/**
 * Video-related type definitions
 */

export interface Video {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  title?: string;
  caption?: string;
  description?: string;
  videoUrl: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount?: number;
  repostsCount?: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  isReposted?: boolean;
  hasCommented?: boolean;
  hasShared?: boolean;
  isFollowing?: boolean;
  isPublic?: boolean;
  createdAt: string;
  hashtags: string[];
  musicInfo?: MusicInfo;
  /** Interactive poll/quiz stickers (metadata; quiz answer is NOT included). */
  interactions?: VideoInteraction[];
}

/** A poll/quiz sticker attached to a video. Normalized position + time window. */
export interface VideoInteraction {
  id: string;
  type: 'poll' | 'quiz';
  question?: string;
  options: string[];
  counts?: number[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  startMs?: number;
  endMs?: number;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  likesCount: number;
  replyCount: number;
  createdAt: string;
  replies?: Comment[];
  isLiked?: boolean;
  parentId?: string;
  voiceUrl?: string;
  voiceDuration?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  total?: number;
}

interface MusicInfo {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
}

export interface VideoFeedResponse {
  videos: Video[];
  nextCursor?: string;
  hasMore: boolean;
}

export type VideoQuality = 'auto' | '1080p' | '720p' | '480p' | '360p';

export interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  quality: VideoQuality;
  isLoading: boolean;
  error?: string;
}

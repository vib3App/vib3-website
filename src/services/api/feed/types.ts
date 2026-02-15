import type { Video, PaginatedResponse } from '@/types';
import { type VideoResponse, transformVideo } from '../videoTransformers';

export type FeedType = 'forYou' | 'following' | 'friends' | 'trending' | 'discover' | 'self';
export type VibeType = 'Energetic' | 'Chill' | 'Creative' | 'Social' | 'Romantic' | 'Funny' | 'Inspirational';

/** Feed video response — alias for the canonical VideoResponse */
export type FeedVideoResponse = VideoResponse;

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

export { transformVideo };

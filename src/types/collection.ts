/**
 * Collection types for playlists, watch later, saved videos
 */
import type { Video } from './video';

export type CollectionType = 'playlist' | 'watch_later' | 'saved' | 'liked' | 'history';

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: CollectionType;
  coverUrl?: string;
  videoCount: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  // Preview of first few videos
  previewVideos?: Video[];
}

export interface CollectionVideo {
  videoId: string;
  addedAt: string;
  note?: string;
  video: Video;
}

export interface CreatePlaylistInput {
  name: string;
  description?: string;
  isPrivate?: boolean;
  videoIds?: string[];
}

export interface UpdatePlaylistInput {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  coverUrl?: string;
}

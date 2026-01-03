/**
 * Playlist types matching Flutter implementation
 */

export type PlaylistType = 'custom' | 'favorites' | 'watchLater' | 'liked' | 'shared' | 'collaborative';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  userId: string;
  videoIds: string[];
  thumbnailUrl?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  videoCount: number;
  totalDuration: number; // in seconds
  type: PlaylistType;
  tags: string[];
  coverImageUrl?: string;
  isCollaborative: boolean;
  collaborators: string[];
}

export interface CreatePlaylistPayload {
  name: string;
  description?: string;
  type?: PlaylistType;
  isPrivate?: boolean;
  tags?: string[];
  coverImageUrl?: string;
}

export interface UpdatePlaylistPayload {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  tags?: string[];
  coverImageUrl?: string;
}

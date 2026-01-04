import { apiClient } from '../client';
import type { Collection, CollectionVideo, CreatePlaylistInput, UpdatePlaylistInput, CollectionType, PaginatedResponse } from '@/types';
import { VideoResponse, transformVideo } from './types';

export const playlistsApi = {
  async getCollections(_type?: CollectionType): Promise<Collection[]> {
    return [];
  },

  async getCollection(collectionId: string): Promise<Collection> {
    const { data } = await apiClient.get<{ collection: Collection }>(`/collections/${collectionId}`);
    return data.collection;
  },

  async getCollectionVideos(collectionId: string, page = 1, limit = 20): Promise<PaginatedResponse<CollectionVideo>> {
    const { data } = await apiClient.get<{
      videos: Array<{ videoId: string; addedAt: string; note?: string; video: VideoResponse }>;
      total: number; page: number; hasMore: boolean;
    }>(`/collections/${collectionId}/videos`, { params: { page, limit } });

    return {
      items: data.videos.map(v => ({ videoId: v.videoId, addedAt: v.addedAt, note: v.note, video: transformVideo(v.video) })),
      total: data.total, page: data.page, hasMore: data.hasMore,
    };
  },

  async createPlaylist(input: CreatePlaylistInput): Promise<Collection> {
    const { data } = await apiClient.post<{ collection: Collection }>('/collections/playlists', input);
    return data.collection;
  },

  async updatePlaylist(playlistId: string, input: UpdatePlaylistInput): Promise<Collection> {
    const { data } = await apiClient.patch<{ collection: Collection }>(`/collections/playlists/${playlistId}`, input);
    return data.collection;
  },

  async deletePlaylist(playlistId: string): Promise<void> {
    await apiClient.delete(`/collections/playlists/${playlistId}`);
  },

  async addToCollection(collectionId: string, videoId: string, note?: string): Promise<void> {
    await apiClient.post(`/collections/${collectionId}/videos`, { videoId, note });
  },

  async removeFromCollection(collectionId: string, videoId: string): Promise<void> {
    await apiClient.delete(`/collections/${collectionId}/videos/${videoId}`);
  },

  async reorderVideos(collectionId: string, videoIds: string[]): Promise<void> {
    await apiClient.put(`/collections/${collectionId}/reorder`, { videoIds });
  },

  async getVideoPlaylists(videoId: string): Promise<Collection[]> {
    const { data } = await apiClient.get<{ playlists: Collection[] }>(`/videos/${videoId}/playlists`);
    return data.playlists;
  },

  async addToPlaylists(videoId: string, playlistIds: string[]): Promise<void> {
    await apiClient.post(`/videos/${videoId}/playlists`, { playlistIds });
  },
};

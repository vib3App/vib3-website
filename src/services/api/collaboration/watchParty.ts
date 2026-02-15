import { apiClient } from '../client';
import type { WatchParty, WatchPartyChatMessage, CreateWatchPartyInput } from '@/types/collaboration';

export const watchPartyApi = {
  async getWatchParties(page = 1, limit = 20): Promise<{ parties: WatchParty[]; hasMore: boolean }> {
    try {
      const { data } = await apiClient.get<{ parties: WatchParty[]; hasMore: boolean }>(
        '/watch-parties',
        { params: { page, limit } }
      );
      return data;
    } catch {
      return { parties: [], hasMore: false };
    }
  },

  async getWatchParty(partyId: string): Promise<WatchParty | null> {
    try {
      const { data } = await apiClient.get<{ party: WatchParty }>(`/watch-parties/${partyId}`);
      return data.party;
    } catch {
      return null;
    }
  },

  async createWatchParty(input: CreateWatchPartyInput): Promise<WatchParty> {
    const { data } = await apiClient.post<{ party: WatchParty }>('/watch-parties', input);
    return data.party;
  },

  async joinWatchParty(partyId: string, inviteCode?: string): Promise<WatchParty> {
    const { data } = await apiClient.post<{ party: WatchParty }>(`/watch-parties/${partyId}/join`, { inviteCode });
    return data.party;
  },

  async leaveWatchParty(partyId: string): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/leave`);
  },

  async addToPlaylist(partyId: string, videoId: string): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/playlist`, { videoId });
  },

  async removeFromPlaylist(partyId: string, videoId: string): Promise<void> {
    await apiClient.delete(`/watch-parties/${partyId}/playlist/${videoId}`);
  },

  async reorderPlaylist(partyId: string, videoIds: string[]): Promise<void> {
    await apiClient.patch(`/watch-parties/${partyId}/playlist`, { videoIds });
  },

  async setPlaybackState(partyId: string, playing: boolean): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/playback`, { playing });
  },

  async seekTo(partyId: string, position: number): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/seek`, { position });
  },

  async skipToNext(partyId: string): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/next`);
  },

  async skipToVideo(partyId: string, videoIndex: number): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/skip`, { videoIndex });
  },

  async getWatchPartyChat(partyId: string, before?: string, limit = 50): Promise<WatchPartyChatMessage[]> {
    try {
      const { data } = await apiClient.get<{ messages: WatchPartyChatMessage[] }>(
        `/watch-parties/${partyId}/chat`,
        { params: { before, limit } }
      );
      return data.messages;
    } catch (error: unknown) {
      if ((error as { status?: number })?.status === 404) return [];
      throw error;
    }
  },

  async sendChatMessage(partyId: string, content: string): Promise<WatchPartyChatMessage> {
    const { data } = await apiClient.post<{ message: WatchPartyChatMessage }>(
      `/watch-parties/${partyId}/chat`,
      { content }
    );
    return data.message;
  },

  async endWatchParty(partyId: string): Promise<void> {
    await apiClient.post(`/watch-parties/${partyId}/end`);
  },
};

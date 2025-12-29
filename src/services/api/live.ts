/**
 * Live Streaming API service
 */
import { apiClient } from './client';
import type {
  LiveStream,
  LiveChatMessage,
  LiveGift,
  CreateLiveStreamInput,
  LiveStreamStats,
  StartStreamResponse,
  JoinStreamResponse,
  LiveKitTokenResponse,
  LiveKitStatus,
} from '@/types';

export const liveApi = {
  /**
   * Get live streams (discover)
   */
  async getLiveStreams(page = 1, limit = 20): Promise<{ streams: LiveStream[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ streams: LiveStream[]; hasMore: boolean }>('/live', {
      params: { page, limit },
    });
    return data;
  },

  /**
   * Get streams from followed users
   */
  async getFollowingLive(): Promise<LiveStream[]> {
    const { data } = await apiClient.get<{ streams: LiveStream[] }>('/live/following');
    return data.streams;
  },

  /**
   * Get a single live stream
   */
  async getLiveStream(streamId: string): Promise<LiveStream> {
    const { data } = await apiClient.get<{ stream: LiveStream }>(`/live/${streamId}`);
    return data.stream;
  },

  /**
   * Create a new live stream
   */
  async createLiveStream(input: CreateLiveStreamInput): Promise<LiveStream> {
    const { data } = await apiClient.post<{ stream: LiveStream }>('/live', input);
    return data.stream;
  },

  /**
   * Start broadcasting (creates LiveKit room and returns host token)
   */
  async startStream(input: CreateLiveStreamInput): Promise<StartStreamResponse> {
    const { data } = await apiClient.post<StartStreamResponse>('/live/start', input);
    return data;
  },

  /**
   * Join a stream as viewer (returns LiveKit viewer token)
   */
  async joinStream(streamId: string): Promise<JoinStreamResponse> {
    const { data } = await apiClient.post<JoinStreamResponse>(`/live/${streamId}/join`);
    return data;
  },

  /**
   * Leave a stream
   */
  async leaveStream(streamId: string): Promise<void> {
    await apiClient.post(`/live/${streamId}/leave`);
  },

  /**
   * Get LiveKit token (for reconnecting)
   */
  async getLiveKitToken(streamId: string): Promise<LiveKitTokenResponse> {
    const { data } = await apiClient.get<LiveKitTokenResponse>(`/live/${streamId}/token`);
    return data;
  },

  /**
   * Check LiveKit availability
   */
  async getLiveKitStatus(): Promise<LiveKitStatus> {
    const { data } = await apiClient.get<LiveKitStatus>('/live/livekit/status');
    return data;
  },

  /**
   * End live stream
   */
  async endStream(streamId: string): Promise<LiveStreamStats> {
    const { data } = await apiClient.post<{ stats: LiveStreamStats }>(`/live/${streamId}/end`);
    return data.stats;
  },

  /**
   * Update stream settings
   */
  async updateStream(streamId: string, updates: Partial<CreateLiveStreamInput>): Promise<LiveStream> {
    const { data } = await apiClient.patch<{ stream: LiveStream }>(`/live/${streamId}`, updates);
    return data.stream;
  },

  /**
   * Delete/cancel stream
   */
  async deleteStream(streamId: string): Promise<void> {
    await apiClient.delete(`/live/${streamId}`);
  },

  // ========== Chat ==========

  /**
   * Get chat messages
   */
  async getChatMessages(
    streamId: string,
    before?: string,
    limit = 50
  ): Promise<LiveChatMessage[]> {
    const { data } = await apiClient.get<{ messages: LiveChatMessage[] }>(
      `/live/${streamId}/chat`,
      { params: { before, limit } }
    );
    return data.messages;
  },

  /**
   * Send chat message
   */
  async sendChatMessage(streamId: string, content: string): Promise<LiveChatMessage> {
    const { data } = await apiClient.post<{ message: LiveChatMessage }>(
      `/live/${streamId}/chat`,
      { content }
    );
    return data.message;
  },

  /**
   * Delete chat message (moderator)
   */
  async deleteChatMessage(streamId: string, messageId: string): Promise<void> {
    await apiClient.delete(`/live/${streamId}/chat/${messageId}`);
  },

  // ========== Reactions ==========

  /**
   * Send reaction
   */
  async sendReaction(
    streamId: string,
    type: 'like' | 'heart' | 'fire' | 'laugh' | 'wow' | 'clap'
  ): Promise<void> {
    await apiClient.post(`/live/${streamId}/reactions`, { type });
  },

  // ========== Gifts ==========

  /**
   * Get available gifts
   */
  async getGifts(): Promise<LiveGift[]> {
    const { data } = await apiClient.get<{ gifts: LiveGift[] }>('/live/gifts');
    return data.gifts;
  },

  /**
   * Send gift
   */
  async sendGift(streamId: string, giftId: string, count = 1): Promise<{ success: boolean; coinsSpent: number }> {
    const { data } = await apiClient.post<{ success: boolean; coinsSpent: number }>(
      `/live/${streamId}/gifts`,
      { giftId, count }
    );
    return data;
  },

  // ========== Guests ==========

  /**
   * Request to join as guest
   */
  async requestToJoin(streamId: string): Promise<{ requestId: string }> {
    const { data } = await apiClient.post<{ requestId: string }>(`/live/${streamId}/guests/request`);
    return data;
  },

  /**
   * Get pending guest requests (host only)
   */
  async getGuestRequests(streamId: string): Promise<Array<{ requestId: string; userId: string; username: string; avatar?: string }>> {
    const { data } = await apiClient.get<{ requests: Array<{ requestId: string; userId: string; username: string; avatar?: string }> }>(
      `/live/${streamId}/guests/requests`
    );
    return data.requests;
  },

  /**
   * Accept guest request (host only)
   */
  async acceptGuest(streamId: string, requestId: string): Promise<void> {
    await apiClient.post(`/live/${streamId}/guests/${requestId}/accept`);
  },

  /**
   * Reject guest request (host only)
   */
  async rejectGuest(streamId: string, requestId: string): Promise<void> {
    await apiClient.post(`/live/${streamId}/guests/${requestId}/reject`);
  },

  /**
   * Remove guest (host only)
   */
  async removeGuest(streamId: string, guestUserId: string): Promise<void> {
    await apiClient.delete(`/live/${streamId}/guests/${guestUserId}`);
  },

  /**
   * Leave as guest
   */
  async leaveAsGuest(streamId: string): Promise<void> {
    await apiClient.post(`/live/${streamId}/guests/leave`);
  },

  /**
   * Toggle guest mute (host only)
   */
  async toggleGuestMute(streamId: string, guestUserId: string, muted: boolean): Promise<void> {
    await apiClient.patch(`/live/${streamId}/guests/${guestUserId}`, { isMuted: muted });
  },

  // ========== Moderation ==========

  /**
   * Ban user from chat
   */
  async banUser(streamId: string, userId: string, reason?: string): Promise<void> {
    await apiClient.post(`/live/${streamId}/ban`, { userId, reason });
  },

  /**
   * Unban user
   */
  async unbanUser(streamId: string, userId: string): Promise<void> {
    await apiClient.delete(`/live/${streamId}/ban/${userId}`);
  },

  /**
   * Get banned users
   */
  async getBannedUsers(streamId: string): Promise<Array<{ userId: string; username: string; bannedAt: string }>> {
    const { data } = await apiClient.get<{ users: Array<{ userId: string; username: string; bannedAt: string }> }>(
      `/live/${streamId}/banned`
    );
    return data.users;
  },

  // ========== Scheduled ==========

  /**
   * Get my scheduled streams
   */
  async getScheduledStreams(): Promise<LiveStream[]> {
    const { data } = await apiClient.get<{ streams: LiveStream[] }>('/live/scheduled');
    return data.streams;
  },

  /**
   * Get past streams
   */
  async getPastStreams(page = 1): Promise<{ streams: LiveStream[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ streams: LiveStream[]; hasMore: boolean }>('/live/past', {
      params: { page },
    });
    return data;
  },
};

/**
 * Video/Audio Calls API service
 * Uses LiveKit for real-time communication
 */
import { apiClient } from './client';
import type {
  Call,
  StartCallInput,
  StartCallResponse,
  AnswerCallResponse,
} from '@/types/call';
import { logger } from '@/utils/logger';

export const callsApi = {
  /**
   * Start a call with another user
   */
  async startCall(input: StartCallInput): Promise<StartCallResponse> {
    const { data } = await apiClient.post<StartCallResponse>('/calls/start', input);
    return data;
  },

  /**
   * Answer an incoming call
   */
  async answerCall(callId: string): Promise<AnswerCallResponse> {
    const { data } = await apiClient.post<AnswerCallResponse>(`/calls/${callId}/answer`);
    return data;
  },

  /**
   * Decline an incoming call
   */
  async declineCall(callId: string): Promise<void> {
    await apiClient.post(`/calls/${callId}/decline`);
  },

  /**
   * End an active call
   */
  async endCall(callId: string): Promise<{ duration: number }> {
    const { data } = await apiClient.post<{ duration: number }>(`/calls/${callId}/end`);
    return data;
  },

  /**
   * Get call details
   */
  async getCall(callId: string): Promise<Call> {
    const { data } = await apiClient.get<{ call: Call }>(`/calls/${callId}`);
    return data.call;
  },

  /**
   * Get call history with a user
   */
  async getCallHistory(
    userId?: string,
    page = 1,
    limit = 20
  ): Promise<{ calls: Call[]; hasMore: boolean }> {
    const params: Record<string, unknown> = { page, limit };
    if (userId) params.userId = userId;
    const { data } = await apiClient.get<{ calls: Call[]; hasMore: boolean }>('/calls/history', {
      params,
    });
    return data;
  },

  /**
   * Toggle mute status
   */
  async toggleMute(callId: string, muted: boolean): Promise<void> {
    await apiClient.post(`/calls/${callId}/mute`, { muted });
  },

  /**
   * Toggle video status
   */
  async toggleVideo(callId: string, videoOff: boolean): Promise<void> {
    await apiClient.post(`/calls/${callId}/video`, { videoOff });
  },

  /**
   * GAP-13: Get call permission for a conversation (matches Flutter endpoint)
   */
  async getCallPermission(conversationId: string): Promise<{ permission: string }> {
    const { data } = await apiClient.get<{ permission: string }>(
      `/chats/${conversationId}/call-permission`
    );
    return data;
  },

  /**
   * GAP-13: Update call permission for a conversation (matches Flutter endpoint)
   */
  async updateCallPermission(conversationId: string, permission: string): Promise<void> {
    await apiClient.put(`/chats/${conversationId}/call-permission`, { permission });
  },

  /**
   * GAP-13: Get/update global call privacy setting
   */
  async getCallPrivacy(): Promise<{ permission: string }> {
    try {
      const { data } = await apiClient.get<{ permission: string }>('/user/call-privacy');
      return data;
    } catch (err) {
      logger.error('Failed to fetch call privacy setting:', err);
      throw err;
    }
  },

  async updateCallPrivacy(permission: string): Promise<void> {
    await apiClient.put('/user/call-privacy', { permission });
  },

  /**
   * Check if user is available for calls
   */
  async checkAvailability(userId: string): Promise<{ available: boolean; reason?: string }> {
    try {
      const { data } = await apiClient.get<{ available: boolean; reason?: string }>(
        `/calls/availability/${userId}`
      );
      return data;
    } catch (err) {
      logger.error('Failed to check call availability:', err);
      return { available: false, reason: 'Unable to check availability' };
    }
  },
};

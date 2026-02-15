/**
 * Video/Audio Calls API service
 * Uses LiveKit for real-time communication
 */
import { apiClient } from './client';
import type {
  Call,
  CallType,
  StartCallInput,
  StartCallResponse,
  AnswerCallResponse,
} from '@/types/call';

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
   * Check if user is available for calls
   */
  async checkAvailability(userId: string): Promise<{ available: boolean; reason?: string }> {
    try {
      const { data } = await apiClient.get<{ available: boolean; reason?: string }>(
        `/calls/availability/${userId}`
      );
      return data;
    } catch {
      return { available: true };
    }
  },
};

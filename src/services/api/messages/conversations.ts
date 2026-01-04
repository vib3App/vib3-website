import { apiClient } from '../client';
import type { Conversation, PaginatedResponse } from '@/types';
import { ConversationResponse, transformConversation } from './types';

export const conversationsApi = {
  async getConversations(page = 1, _limit = 20): Promise<PaginatedResponse<Conversation>> {
    return { items: [], total: 0, page, hasMore: false };
  },

  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const { data } = await apiClient.post<ConversationResponse>('/messages/conversations', { participantId: userId });
    return transformConversation(data);
  },

  async getConversation(conversationId: string): Promise<Conversation> {
    const { data } = await apiClient.get<ConversationResponse>(`/messages/conversations/${conversationId}`);
    return transformConversation(data);
  },

  async toggleMute(conversationId: string): Promise<{ muted: boolean }> {
    const { data } = await apiClient.post<{ muted: boolean }>(`/messages/conversations/${conversationId}/mute`);
    return data;
  },

  async togglePin(conversationId: string): Promise<{ pinned: boolean }> {
    const { data } = await apiClient.post<{ pinned: boolean }>(`/messages/conversations/${conversationId}/pin`);
    return data;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/messages/conversations/${conversationId}`);
  },

  async createGroupConversation(name: string, participantIds: string[]): Promise<Conversation> {
    const { data } = await apiClient.post<ConversationResponse>('/messages/conversations/group', { name, participantIds });
    return transformConversation(data);
  },

  async addParticipants(conversationId: string, userIds: string[]): Promise<void> {
    await apiClient.post(`/messages/conversations/${conversationId}/participants`, { userIds });
  },

  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    await apiClient.delete(`/messages/conversations/${conversationId}/participants/${userId}`);
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ unreadCount: number }>('/messages/unread-count');
    return data.unreadCount;
  },
};

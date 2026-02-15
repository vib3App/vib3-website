import { apiClient } from '../client';
import type { Message, SendMessagePayload, PaginatedResponse, Conversation } from '@/types';
import { MessageResponse, ConversationResponse, transformMessage, transformConversation } from './types';

export const messagingApi = {
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<PaginatedResponse<Message>> {
    const { data } = await apiClient.get<{ messages: MessageResponse[]; total: number; page: number; hasMore: boolean }>(
      `/messages/conversations/${conversationId}/messages`,
      { params: { page, limit } }
    );
    return { items: data.messages.map(transformMessage), total: data.total, page: data.page, hasMore: data.hasMore };
  },

  async sendMessage(conversationId: string, payload: SendMessagePayload): Promise<Message> {
    const { data } = await apiClient.post<MessageResponse>(`/messages/conversations/${conversationId}/messages`, payload);
    return transformMessage(data);
  },

  async sendMediaMessage(conversationId: string, file: File, type: 'image' | 'video' | 'voice'): Promise<Message> {
    const formData = new FormData();
    formData.append('media', file);
    formData.append('type', type);
    const { data } = await apiClient.post<MessageResponse>(
      `/messages/conversations/${conversationId}/messages/media`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return transformMessage(data);
  },

  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.post(`/messages/conversations/${conversationId}/read`);
  },

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await apiClient.delete(`/messages/conversations/${conversationId}/messages/${messageId}`);
  },

  async addReaction(conversationId: string, messageId: string, emoji: string): Promise<void> {
    await apiClient.post(`/messages/conversations/${conversationId}/messages/${messageId}/reactions`, { emoji });
  },

  async removeReaction(conversationId: string, messageId: string, emoji: string): Promise<void> {
    await apiClient.delete(`/messages/conversations/${conversationId}/messages/${messageId}/reactions/${emoji}`);
  },

  async getMessageRequests(page = 1, limit = 20): Promise<PaginatedResponse<Conversation>> {
    try {
      const { data } = await apiClient.get<{ requests: ConversationResponse[]; total: number; page: number; hasMore: boolean }>(
        '/messages/requests',
        { params: { page, limit } }
      );
      return { items: data.requests.map(transformConversation), total: data.total, page: data.page, hasMore: data.hasMore };
    } catch {
      return { items: [], total: 0, page, hasMore: false };
    }
  },

  async acceptRequest(conversationId: string): Promise<void> {
    await apiClient.post(`/messages/requests/${conversationId}/accept`);
  },

  async declineRequest(conversationId: string): Promise<void> {
    await apiClient.post(`/messages/requests/${conversationId}/decline`);
  },

  async getRequestCount(): Promise<number> {
    try {
      const { data } = await apiClient.get<{ count: number }>('/messages/requests/count');
      return data.count;
    } catch {
      return 0;
    }
  },
};

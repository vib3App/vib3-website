import { apiClient } from '../client';
import type { Conversation, PaginatedResponse } from '@/types';
import { ConversationResponse, transformConversation } from './types';

export const conversationsApi = {
  async getConversations(page = 1, limit = 20): Promise<PaginatedResponse<Conversation>> {
    try {
      const { data } = await apiClient.get<{ chats: Array<{
        _id: string;
        isGroup: boolean;
        participants: string[];
        groupName?: string;
        groupImage?: string;
        lastMessage?: string;
        lastMessageTime?: string;
        lastMessageSender?: { username?: string };
        unreadCount: number;
        isMuted?: boolean;
        otherUser?: { _id: string; username: string; profileImageUrl?: string };
        createdAt: string;
        updatedAt: string;
      }> }>('/chats');

      const chats = data.chats || [];
      const start = (page - 1) * limit;
      const paged = chats.slice(start, start + limit);

      const items: Conversation[] = paged.map(chat => ({
        id: chat._id,
        type: chat.isGroup ? 'group' : 'direct',
        name: chat.isGroup ? chat.groupName : chat.otherUser?.username,
        avatar: chat.isGroup ? chat.groupImage : chat.otherUser?.profileImageUrl,
        participants: (chat.participants || []).map(p =>
          typeof p === 'string' ? { userId: p, username: '' } : { userId: p, username: '' }
        ),
        lastMessage: chat.lastMessage ? {
          id: '',
          conversationId: chat._id,
          senderId: '',
          senderUsername: chat.lastMessageSender?.username || '',
          content: chat.lastMessage,
          type: 'text' as const,
          createdAt: chat.lastMessageTime || chat.updatedAt,
          status: 'sent' as const,
        } : undefined,
        unreadCount: chat.unreadCount || 0,
        isMuted: chat.isMuted,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      }));

      return { items, total: chats.length, page, hasMore: start + limit < chats.length };
    } catch {
      return { items: [], total: 0, page, hasMore: false };
    }
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

/**
 * Messages API service
 * Handles DM and conversation operations
 */
import { apiClient } from './client';
import type {
  Message,
  Conversation,
  SendMessagePayload,
  PaginatedResponse,
} from '@/types';

interface MessageResponse {
  _id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  content: string;
  type: Message['type'];
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaDuration?: number;
  replyTo?: {
    id: string;
    content: string;
    senderUsername: string;
  };
  reactions?: Message['reactions'];
  readBy?: string[];
  createdAt: string;
  updatedAt?: string;
  status: Message['status'];
}

interface ConversationResponse {
  _id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  participants: Conversation['participants'];
  lastMessage?: MessageResponse;
  unreadCount: number;
  isMuted?: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const messagesApi = {
  /**
   * Get all conversations
   * DISABLED: Backend doesn't support this endpoint yet (returns 404)
   */
  async getConversations(page = 1, _limit = 20): Promise<PaginatedResponse<Conversation>> {
    // Backend doesn't have /messages/conversations endpoint for web
    // Return empty to prevent 404 errors and re-render loops
    return {
      items: [],
      total: 0,
      page,
      hasMore: false,
    };
  },

  /**
   * Get or create a direct conversation with a user
   */
  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const { data } = await apiClient.post<ConversationResponse>(
      '/messages/conversations',
      { participantId: userId }
    );
    return transformConversation(data);
  },

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const { data } = await apiClient.get<ConversationResponse>(
      `/messages/conversations/${conversationId}`
    );
    return transformConversation(data);
  },

  /**
   * Get messages in a conversation
   */
  async getMessages(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<Message>> {
    const { data } = await apiClient.get<{
      messages: MessageResponse[];
      total: number;
      page: number;
      hasMore: boolean;
    }>(`/messages/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });

    return {
      items: data.messages.map(transformMessage),
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    payload: SendMessagePayload
  ): Promise<Message> {
    const { data } = await apiClient.post<MessageResponse>(
      `/messages/conversations/${conversationId}/messages`,
      payload
    );
    return transformMessage(data);
  },

  /**
   * Send a media message
   */
  async sendMediaMessage(
    conversationId: string,
    file: File,
    type: 'image' | 'video' | 'voice'
  ): Promise<Message> {
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

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.post(`/messages/conversations/${conversationId}/read`);
  },

  /**
   * Delete a message
   */
  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await apiClient.delete(
      `/messages/conversations/${conversationId}/messages/${messageId}`
    );
  },

  /**
   * React to a message
   */
  async addReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<void> {
    await apiClient.post(
      `/messages/conversations/${conversationId}/messages/${messageId}/reactions`,
      { emoji }
    );
  },

  /**
   * Remove reaction from a message
   */
  async removeReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<void> {
    await apiClient.delete(
      `/messages/conversations/${conversationId}/messages/${messageId}/reactions/${emoji}`
    );
  },

  /**
   * Mute/unmute a conversation
   */
  async toggleMute(conversationId: string): Promise<{ muted: boolean }> {
    const { data } = await apiClient.post<{ muted: boolean }>(
      `/messages/conversations/${conversationId}/mute`
    );
    return data;
  },

  /**
   * Pin/unpin a conversation
   */
  async togglePin(conversationId: string): Promise<{ pinned: boolean }> {
    const { data } = await apiClient.post<{ pinned: boolean }>(
      `/messages/conversations/${conversationId}/pin`
    );
    return data;
  },

  /**
   * Delete/leave a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/messages/conversations/${conversationId}`);
  },

  /**
   * Create a group conversation
   */
  async createGroupConversation(
    name: string,
    participantIds: string[]
  ): Promise<Conversation> {
    const { data } = await apiClient.post<ConversationResponse>(
      '/messages/conversations/group',
      { name, participantIds }
    );
    return transformConversation(data);
  },

  /**
   * Add participants to a group
   */
  async addParticipants(
    conversationId: string,
    userIds: string[]
  ): Promise<void> {
    await apiClient.post(
      `/messages/conversations/${conversationId}/participants`,
      { userIds }
    );
  },

  /**
   * Remove participant from a group
   */
  async removeParticipant(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await apiClient.delete(
      `/messages/conversations/${conversationId}/participants/${userId}`
    );
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ unreadCount: number }>(
      '/messages/unread-count'
    );
    return data.unreadCount;
  },

  /**
   * Get message requests (messages from non-followers)
   */
  async getMessageRequests(page = 1, limit = 20): Promise<PaginatedResponse<Conversation>> {
    try {
      const { data } = await apiClient.get<{
        requests: ConversationResponse[];
        total: number;
        page: number;
        hasMore: boolean;
      }>('/messages/requests', { params: { page, limit } });

      return {
        items: data.requests.map(transformConversation),
        total: data.total,
        page: data.page,
        hasMore: data.hasMore,
      };
    } catch (error) {
      console.warn('Message requests endpoint not available:', error);
      return { items: [], total: 0, page, hasMore: false };
    }
  },

  /**
   * Accept a message request
   */
  async acceptRequest(conversationId: string): Promise<void> {
    await apiClient.post(`/messages/requests/${conversationId}/accept`);
  },

  /**
   * Decline a message request
   */
  async declineRequest(conversationId: string): Promise<void> {
    await apiClient.post(`/messages/requests/${conversationId}/decline`);
  },

  /**
   * Get message request count
   */
  async getRequestCount(): Promise<number> {
    try {
      const { data } = await apiClient.get<{ count: number }>('/messages/requests/count');
      return data.count;
    } catch {
      return 0;
    }
  },
};

function transformMessage(data: MessageResponse): Message {
  return {
    id: data._id,
    conversationId: data.conversationId,
    senderId: data.senderId,
    senderUsername: data.senderUsername,
    senderAvatar: data.senderAvatar,
    content: data.content,
    type: data.type,
    mediaUrl: data.mediaUrl,
    mediaThumbnail: data.mediaThumbnail,
    mediaDuration: data.mediaDuration,
    replyTo: data.replyTo,
    reactions: data.reactions,
    readBy: data.readBy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    status: data.status,
  };
}

function transformConversation(data: ConversationResponse): Conversation {
  return {
    id: data._id,
    type: data.type,
    name: data.name,
    avatar: data.avatar,
    participants: data.participants,
    lastMessage: data.lastMessage ? transformMessage(data.lastMessage) : undefined,
    unreadCount: data.unreadCount,
    isMuted: data.isMuted,
    isPinned: data.isPinned,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

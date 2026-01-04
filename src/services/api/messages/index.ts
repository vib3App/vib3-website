import { conversationsApi } from './conversations';
import { messagingApi } from './messaging';

export const messagesApi = {
  // Conversations
  getConversations: conversationsApi.getConversations,
  getOrCreateConversation: conversationsApi.getOrCreateConversation,
  getConversation: conversationsApi.getConversation,
  toggleMute: conversationsApi.toggleMute,
  togglePin: conversationsApi.togglePin,
  deleteConversation: conversationsApi.deleteConversation,
  createGroupConversation: conversationsApi.createGroupConversation,
  addParticipants: conversationsApi.addParticipants,
  removeParticipant: conversationsApi.removeParticipant,
  getUnreadCount: conversationsApi.getUnreadCount,

  // Messaging
  getMessages: messagingApi.getMessages,
  sendMessage: messagingApi.sendMessage,
  sendMediaMessage: messagingApi.sendMediaMessage,
  markAsRead: messagingApi.markAsRead,
  deleteMessage: messagingApi.deleteMessage,
  addReaction: messagingApi.addReaction,
  removeReaction: messagingApi.removeReaction,
  getMessageRequests: messagingApi.getMessageRequests,
  acceptRequest: messagingApi.acceptRequest,
  declineRequest: messagingApi.declineRequest,
  getRequestCount: messagingApi.getRequestCount,
};

import type { Message, Conversation } from '@/types';

export interface MessageResponse {
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
  replyTo?: { id: string; content: string; senderUsername: string };
  reactions?: Message['reactions'];
  readBy?: string[];
  createdAt: string;
  updatedAt?: string;
  status: Message['status'];
}

export interface ConversationResponse {
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

export function transformMessage(data: MessageResponse): Message {
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

export function transformConversation(data: ConversationResponse): Conversation {
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

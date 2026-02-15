/**
 * Message and conversation type definitions
 */

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'gif' | 'sticker';
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaDuration?: number;
  replyTo?: {
    id: string;
    content: string;
    senderUsername: string;
  };
  reactions?: MessageReaction[];
  readBy?: string[];
  createdAt: string;
  updatedAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

interface MessageReaction {
  emoji: string;
  userId: string;
  username: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isMuted?: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ConversationParticipant {
  userId: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  role?: 'admin' | 'member';
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface MessageEvent {
  type: 'message' | 'typing' | 'read' | 'reaction' | 'delete' | 'edit';
  data: Message | TypingIndicator | { messageId: string; userId: string };
}

export interface SendMessagePayload {
  content?: string;
  type: Message['type'];
  mediaUrl?: string;
  replyToId?: string;
}

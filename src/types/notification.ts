/**
 * Notification type definitions
 */

export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'reply'
  | 'message'
  | 'live'
  | 'collab'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  userId: string;
  fromUser?: {
    id: string;
    username: string;
    avatar?: string;
    isVerified?: boolean;
  };
  data?: {
    videoId?: string;
    videoThumbnail?: string;
    commentId?: string;
    conversationId?: string;
    liveStreamId?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
  mentions: boolean;
  messages: boolean;
  liveStreams: boolean;
  systemUpdates: boolean;
}


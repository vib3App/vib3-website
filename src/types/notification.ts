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

export interface DoNotDisturbSettings {
  enabled: boolean;
  startTime: string; // 'HH:MM' 24h
  endTime: string;   // 'HH:MM' 24h
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailNotifications: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
  mentions: boolean;
  directMessages: boolean;
  liveStreams: boolean;
  videoUploads: boolean;
  milestones: boolean;
  echoes: boolean;
  bounces: boolean;
  doNotDisturb: DoNotDisturbSettings;
}


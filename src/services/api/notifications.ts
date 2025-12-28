/**
 * Notifications API service
 * Handles notification operations
 */
import { apiClient } from './client';
import type { Notification, NotificationSettings, PaginatedResponse } from '@/types';

interface NotificationResponse {
  _id: string;
  type: Notification['type'];
  title: string;
  body: string;
  userId: string;
  fromUser?: {
    _id: string;
    username: string;
    profilePicture?: string;
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

export const notificationsApi = {
  /**
   * Get all notifications
   */
  async getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    const { data } = await apiClient.get<{
      notifications: NotificationResponse[];
      total: number;
      page: number;
      hasMore: boolean;
    }>('/notifications', { params: { page, limit } });

    return {
      items: data.notifications.map(transformNotification),
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ unreadCount: number }>('/notifications/unread-count');
    return data.unreadCount;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.post(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/notifications/${notificationId}`);
  },

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    await apiClient.delete('/notifications/clear-all');
  },

  /**
   * Get notification settings
   */
  async getSettings(): Promise<NotificationSettings> {
    const { data } = await apiClient.get<NotificationSettings>('/notifications/settings');
    return data;
  },

  /**
   * Update notification settings
   */
  async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const { data } = await apiClient.put<NotificationSettings>('/notifications/settings', settings);
    return data;
  },

  /**
   * Register for push notifications
   */
  async registerPushSubscription(subscription: PushSubscription): Promise<void> {
    await apiClient.post('/notifications/push-subscription', {
      subscription: subscription.toJSON(),
    });
  },

  /**
   * Unregister push subscription
   */
  async unregisterPushSubscription(): Promise<void> {
    await apiClient.delete('/notifications/push-subscription');
  },
};

function transformNotification(data: NotificationResponse): Notification {
  return {
    id: data._id,
    type: data.type,
    title: data.title,
    body: data.body,
    userId: data.userId,
    fromUser: data.fromUser ? {
      id: data.fromUser._id,
      username: data.fromUser.username,
      avatar: data.fromUser.profilePicture,
      isVerified: data.fromUser.isVerified,
    } : undefined,
    data: data.data,
    isRead: data.isRead,
    createdAt: data.createdAt,
  };
}

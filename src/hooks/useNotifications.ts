'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { notificationsApi } from '@/services/api';
import { websocketService } from '@/services/websocket';
import { desktopNotifications } from '@/services/desktopNotifications';
import type { Notification } from '@/types';

export type NotificationTab = 'all' | 'mentions';

export function useNotifications() {
  const router = useRouter();
  const { user, isAuthenticated, isAuthVerified } = useAuthStore();
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  const loadNotifications = useCallback(async (pageNum: number, append = false) => {
    try {
      const response = await notificationsApi.getNotifications(pageNum, 20);
      if (append) {
        setNotifications(prev => [...prev, ...response.items]);
      } else {
        setNotifications(response.items);
      }
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to be verified before checking authentication
    if (!isAuthVerified) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/notifications');
      return;
    }

    loadNotifications(1);
    setPermissionStatus(desktopNotifications.getPermission());

    if (user?.token) {
      websocketService.connect(user.token);

      const unsubNotification = websocketService.onNotification((notification) => {
        setNotifications(prev => [{
          ...notification,
          isRead: false,
        } as Notification, ...prev]);

        if (permissionStatus === 'granted') {
          desktopNotifications.show(notification as Notification);
        }
      });

      return () => {
        unsubNotification();
      };
    }
  }, [isAuthVerified, isAuthenticated, user?.token, router, loadNotifications, permissionStatus]);

  const handleMarkRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleEnableNotifications = async () => {
    const permission = await desktopNotifications.requestPermission();
    setPermissionStatus(permission);

    if (permission === 'granted') {
      const subscription = await desktopNotifications.subscribeToPush();
      if (subscription) {
        await notificationsApi.registerPushSubscription(subscription);
      }
    }
  };

  const loadMore = () => loadNotifications(page + 1, true);

  const filteredNotifications = activeTab === 'mentions'
    ? notifications.filter(n => n.type === 'mention')
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    isAuthenticated,
    isAuthVerified,
    activeTab,
    setActiveTab,
    notifications: filteredNotifications,
    isLoading,
    hasMore,
    loadMore,
    unreadCount,
    permissionStatus,
    handleMarkRead,
    handleMarkAllRead,
    handleEnableNotifications,
    isNotificationsAvailable: desktopNotifications.isAvailable(),
  };
}

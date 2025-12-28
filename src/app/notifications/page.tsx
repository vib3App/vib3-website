'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { notificationsApi } from '@/services/api';
import { websocketService } from '@/services/websocket';
import { desktopNotifications } from '@/services/desktopNotifications';
import type { Notification, NotificationType } from '@/types';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case 'like':
      return (
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      );
    case 'comment':
    case 'reply':
      return (
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      );
    case 'follow':
      return (
        <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#6366F1]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      );
    case 'mention':
      return (
        <div className="w-8 h-8 rounded-full bg-[#14B8A6]/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        </div>
      );
    case 'message':
      return (
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </div>
      );
    case 'live':
      return (
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
        </div>
      );
  }
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const getLink = (): string => {
    const { type, data, fromUser } = notification;

    switch (type) {
      case 'like':
      case 'comment':
      case 'mention':
      case 'reply':
        return data?.videoId ? `/feed?video=${data.videoId}` : '#';
      case 'follow':
        return fromUser?.id ? `/profile/${fromUser.id}` : '#';
      case 'message':
        return data?.conversationId ? `/messages/${data.conversationId}` : '/messages';
      case 'live':
        return data?.liveStreamId ? `/live/${data.liveStreamId}` : '/live';
      default:
        return '#';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
  };

  return (
    <Link
      href={getLink()}
      onClick={handleClick}
      className={`flex items-center gap-3 p-4 hover:bg-white/5 transition-colors ${
        !notification.isRead ? 'bg-[#6366F1]/5' : ''
      }`}
    >
      {notification.fromUser?.avatar ? (
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={notification.fromUser.avatar}
              alt={notification.fromUser.username}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1">
            <NotificationIcon type={notification.type} />
          </div>
        </div>
      ) : (
        <NotificationIcon type={notification.type} />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm">
          {notification.fromUser && (
            <span className="font-semibold">{notification.fromUser.username} </span>
          )}
          {notification.body}
        </p>
        <p className="text-white/50 text-xs mt-1">{timeAgo(notification.createdAt)}</p>
      </div>

      {notification.data?.videoThumbnail && (
        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={notification.data.videoThumbnail}
            alt="Video"
            width={48}
            height={64}
            className="object-cover"
          />
        </div>
      )}

      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-[#6366F1] flex-shrink-0" />
      )}
    </Link>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'mentions'>('all');
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
    if (!isAuthenticated) {
      router.push('/login?redirect=/notifications');
      return;
    }

    loadNotifications(1);
    setPermissionStatus(desktopNotifications.getPermission());

    // Connect to WebSocket for real-time notifications
    if (user?.token) {
      websocketService.connect(user.token);

      const unsubNotification = websocketService.onNotification((notification) => {
        // Add new notification to the top
        setNotifications(prev => [{
          ...notification,
          isRead: false,
        } as Notification, ...prev]);

        // Show desktop notification if enabled
        if (permissionStatus === 'granted') {
          desktopNotifications.show(notification as Notification);
        }
      });

      return () => {
        unsubNotification();
      };
    }
  }, [isAuthenticated, user?.token, router, loadNotifications, permissionStatus]);

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
      // Subscribe to push notifications
      const subscription = await desktopNotifications.subscribeToPush();
      if (subscription) {
        await notificationsApi.registerPushSubscription(subscription);
      }
    }
  };

  const filteredNotifications = activeTab === 'mentions'
    ? notifications.filter(n => n.type === 'mention')
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0E1A]">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[#6366F1] hover:text-[#5558E3] text-sm font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Desktop notification prompt */}
          {permissionStatus === 'default' && desktopNotifications.isAvailable() && (
            <div className="px-4 pb-3">
              <button
                onClick={handleEnableNotifications}
                className="w-full bg-[#1A1F2E] text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#252A3E] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Enable desktop notifications
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 text-sm font-medium relative ${
                activeTab === 'all' ? 'text-white' : 'text-white/50'
              }`}
            >
              All Activity
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#14B8A6]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('mentions')}
              className={`flex-1 py-3 text-sm font-medium relative ${
                activeTab === 'mentions' ? 'text-white' : 'text-white/50'
              }`}
            >
              Mentions
              {activeTab === 'mentions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#14B8A6]" />
              )}
            </button>
          </div>
        </header>

        {/* Notifications List */}
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-white/50">No notifications yet</p>
              <p className="text-white/30 text-sm mt-1">
                When you get notifications, they'll show up here
              </p>
            </div>
          ) : (
            <>
              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))}

              {hasMore && (
                <button
                  onClick={() => loadNotifications(page + 1, true)}
                  className="w-full py-4 text-[#6366F1] hover:text-[#5558E3] text-sm font-medium"
                >
                  Load more
                </button>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

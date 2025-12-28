'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NotificationIcon } from './NotificationIcon';
import type { Notification } from '@/types';

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

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
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

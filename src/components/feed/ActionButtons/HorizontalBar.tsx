'use client';

import { ActionButton } from './ActionButton';
import { useActionButtonDrag } from '@/hooks/useActionButtonDrag';
import type { LayoutProps } from '@/types/actionButtons';

export function HorizontalBar({
  video,
  buttons,
  size,
  position,
  isDragging: globalDragging,
  onLike,
  onComment,
  onSave,
  onShare,
  onRepost,
  onDragStart,
  onDragEnd,
  onOpenSettings: _onOpenSettings,
}: LayoutProps) {
  const { isDragging, dragProps } = useActionButtonDrag({
    onDragStart,
    onDragEnd,
    disabled: false,
  });

  const getOnClick = (id: string) => {
    switch (id) {
      case 'like': return onLike;
      case 'comment': return onComment;
      case 'save': return onSave;
      case 'share': return onShare;
      case 'repost': return onRepost;
      default: return undefined;
    }
  };

  const getIsActive = (id: string) => {
    switch (id) {
      case 'like': return video.isLiked;
      case 'save': return video.isFavorited;
      case 'repost': return video.isReposted;
      default: return false;
    }
  };

  const getCount = (id: string) => {
    switch (id) {
      case 'like': return video.likesCount;
      case 'comment': return video.commentsCount;
      case 'repost': return video.repostsCount;
      default: return undefined;
    }
  };

  // Calculate position style
  const positionStyle: React.CSSProperties = isDragging
    ? {
        position: 'fixed',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
      }
    : {
        position: 'absolute',
        bottom: '5rem', // 80px on mobile
        left: '1rem',
        right: '1rem',
      };

  return (
    <div
      {...dragProps}
      className={`z-20 transition-shadow ${isDragging || globalDragging ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/30' : ''}`}
      style={{ ...positionStyle, touchAction: 'none' }}
    >
      <div className="flex items-center justify-between bg-black/30 backdrop-blur-md rounded-2xl px-2 py-2">
        {buttons.map((btn) => (
          <ActionButton
            key={btn.id}
            id={btn.id}
            size={size}
            isActive={getIsActive(btn.id)}
            count={getCount(btn.id)}
            thumbnailUrl={btn.id === 'sound' ? video.thumbnailUrl : undefined}
            videoId={btn.id === 'remix' ? video.id : undefined}
            onClick={getOnClick(btn.id)}
          />
        ))}
      </div>
    </div>
  );
}

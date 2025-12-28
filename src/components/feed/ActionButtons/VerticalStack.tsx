'use client';

import { ActionButton, SettingsButton } from './ActionButton';
import { useActionButtonDrag } from '@/hooks/useActionButtonDrag';
import type { LayoutProps } from '@/types/actionButtons';

export function VerticalStack({
  video,
  buttons,
  size,
  position,
  isDragging: globalDragging,
  onLike,
  onComment,
  onSave,
  onShare,
  onDragStart,
  onDragEnd,
  onOpenSettings,
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
      default: return undefined;
    }
  };

  const getIsActive = (id: string) => {
    switch (id) {
      case 'like': return video.isLiked;
      case 'save': return video.isFavorited;
      default: return false;
    }
  };

  const getCount = (id: string) => {
    switch (id) {
      case 'like': return video.likesCount;
      case 'comment': return video.commentsCount;
      default: return undefined;
    }
  };

  // Calculate position style - right side by default, but with padding from edge
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
        right: '1rem',
        bottom: '35%', // Center-ish vertically
      };

  return (
    <div
      {...dragProps}
      className={`z-20 transition-shadow ${isDragging || globalDragging ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/30 rounded-2xl' : ''}`}
      style={{ ...positionStyle, touchAction: 'none' }}
    >
      <div className="flex flex-col items-center gap-3 bg-black/20 backdrop-blur-sm rounded-2xl p-2">
        {buttons.map((btn) => (
          <div key={btn.id} className="flex flex-col items-center">
            <ActionButton
              id={btn.id}
              size={size}
              isActive={getIsActive(btn.id)}
              thumbnailUrl={btn.id === 'sound' ? video.thumbnailUrl : undefined}
              videoId={btn.id === 'remix' ? video.id : undefined}
              onClick={getOnClick(btn.id)}
            />
            {(btn.id === 'like' || btn.id === 'comment') && (
              <span className="text-white text-xs font-medium -mt-1">
                {btn.id === 'like' ? formatCount(video.likesCount) : formatCount(video.commentsCount)}
              </span>
            )}
          </div>
        ))}
        <SettingsButton size={size} onClick={onOpenSettings} />
      </div>
    </div>
  );
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

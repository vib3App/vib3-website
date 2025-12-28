'use client';

import { ActionButton } from './ActionButton';
import { useActionButtonDrag } from '@/hooks/useActionButtonDrag';
import type { LayoutProps, ButtonId } from '@/types/actionButtons';

export function FloatingPills({
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
}: LayoutProps) {
  // Drag the whole container as a group
  const { isDragging, dragProps } = useActionButtonDrag({
    onDragStart,
    onDragEnd,
  });

  const getOnClick = (id: ButtonId) => {
    switch (id) {
      case 'like': return onLike;
      case 'comment': return onComment;
      case 'save': return onSave;
      case 'share': return onShare;
      default: return undefined;
    }
  };

  const getIsActive = (id: ButtonId) => {
    if (id === 'like') return video.isLiked;
    if (id === 'save') return video.isFavorited;
    return false;
  };

  const getCount = (id: ButtonId) => {
    if (id === 'like') return video.likesCount;
    if (id === 'comment') return video.commentsCount;
    return undefined;
  };

  return (
    <div
      {...dragProps}
      className={`absolute z-20 transition-all ${isDragging || globalDragging ? 'ring-2 ring-amber-400 rounded-2xl shadow-lg shadow-amber-400/30' : ''}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        touchAction: 'none',
      }}
    >
      {/* Container that holds all buttons together */}
      <div className="flex flex-col gap-2 p-2 bg-black/30 backdrop-blur-sm rounded-2xl">
        {buttons.map((btn) => (
          <div key={btn.id} className="bg-black/40 backdrop-blur-sm rounded-full">
            <ActionButton
              id={btn.id}
              size={size}
              isActive={getIsActive(btn.id)}
              count={getCount(btn.id)}
              thumbnailUrl={btn.id === 'sound' ? video.thumbnailUrl : undefined}
              videoId={btn.id === 'remix' ? video.id : undefined}
              onClick={getOnClick(btn.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

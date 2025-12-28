'use client';

import { useState } from 'react';
import { ActionButton, SettingsButton } from './ActionButton';
import { useActionButtonDrag } from '@/hooks/useActionButtonDrag';
import type { LayoutProps, ButtonId, Position } from '@/types/actionButtons';
import { useActionButtonStore } from '@/stores/actionButtonStore';

interface FloatingButtonProps {
  id: ButtonId;
  position: Position;
  size: LayoutProps['size'];
  video: LayoutProps['video'];
  onClick?: () => void;
  onPositionChange: (id: ButtonId, pos: Position) => void;
  globalDragging: boolean;
}

function FloatingButton({
  id,
  position,
  size,
  video,
  onClick,
  onPositionChange,
  globalDragging,
}: FloatingButtonProps) {
  const { isDragging, dragProps } = useActionButtonDrag({
    onDragEnd: (pos) => onPositionChange(id, pos),
  });

  const getIsActive = () => {
    if (id === 'like') return video.isLiked;
    if (id === 'save') return video.isFavorited;
    return false;
  };

  const getCount = () => {
    if (id === 'like') return video.likesCount;
    if (id === 'comment') return video.commentsCount;
    return undefined;
  };

  return (
    <div
      {...dragProps}
      className={`absolute z-20 transition-all ${isDragging || globalDragging ? 'ring-2 ring-amber-400 rounded-full shadow-lg shadow-amber-400/30' : ''}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        touchAction: 'none',
      }}
    >
      <div className="bg-black/40 backdrop-blur-sm rounded-full">
        <ActionButton
          id={id}
          size={size}
          isActive={getIsActive()}
          count={getCount()}
          thumbnailUrl={id === 'sound' ? video.thumbnailUrl : undefined}
          videoId={id === 'remix' ? video.id : undefined}
          onClick={onClick}
        />
      </div>
    </div>
  );
}

export function FloatingPills({
  video,
  buttons,
  size,
  isDragging: globalDragging,
  onLike,
  onComment,
  onSave,
  onShare,
  onOpenSettings,
}: LayoutProps) {
  const { preferences, setButtonPosition } = useActionButtonStore();
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  const getOnClick = (id: ButtonId) => {
    switch (id) {
      case 'like': return onLike;
      case 'comment': return onComment;
      case 'save': return onSave;
      case 'share': return onShare;
      default: return undefined;
    }
  };

  const handlePositionChange = (id: ButtonId, pos: Position) => {
    setButtonPosition(id, pos, isMobile);
  };

  // Default positions if not set
  const getPosition = (id: ButtonId, index: number): Position => {
    const stored = preferences.positions[id];
    if (stored) return stored;
    // Default: right side, staggered vertically
    return {
      x: 90,
      y: 25 + index * 12,
    };
  };

  return (
    <>
      {buttons.map((btn, index) => (
        <FloatingButton
          key={btn.id}
          id={btn.id}
          position={getPosition(btn.id, index)}
          size={size}
          video={video}
          onClick={getOnClick(btn.id)}
          onPositionChange={handlePositionChange}
          globalDragging={globalDragging}
        />
      ))}
      {/* Settings button - fixed position */}
      <div
        className="absolute z-20"
        style={{ right: '0.5rem', bottom: '5rem' }}
      >
        <div className="bg-black/40 backdrop-blur-sm rounded-full">
          <SettingsButton size={size} onClick={onOpenSettings} />
        </div>
      </div>
    </>
  );
}

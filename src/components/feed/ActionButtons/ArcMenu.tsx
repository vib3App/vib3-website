'use client';

import { useState } from 'react';
import { ActionButton, SettingsButton } from './ActionButton';
import { useActionButtonDrag } from '@/hooks/useActionButtonDrag';
import type { LayoutProps } from '@/types/actionButtons';

export function ArcMenu({
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Calculate arc positions for buttons
  const getArcPosition = (index: number, total: number) => {
    // Arc spans from -90deg (up) to 0deg (right) in bottom-right position
    const startAngle = -120; // degrees
    const endAngle = -30;
    const angleStep = (endAngle - startAngle) / (total - 1 || 1);
    const angle = startAngle + angleStep * index;
    const radians = (angle * Math.PI) / 180;
    const radius = 80; // pixels

    return {
      x: Math.cos(radians) * radius,
      y: Math.sin(radians) * radius,
    };
  };

  // Position style
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
        bottom: '8rem',
      };

  return (
    <div
      {...dragProps}
      className={`z-20 ${isDragging || globalDragging ? 'ring-2 ring-amber-400 rounded-full shadow-lg shadow-amber-400/30' : ''}`}
      style={{ ...positionStyle, touchAction: 'none' }}
    >
      {/* Expanded arc buttons */}
      <div className="relative">
        {buttons.map((btn, index) => {
          const arcPos = getArcPosition(index, buttons.length);
          return (
            <div
              key={btn.id}
              className={`absolute transition-all duration-300 ease-out ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
              style={{
                transform: `translate(${arcPos.x}px, ${arcPos.y}px)`,
                transitionDelay: `${index * 30}ms`,
              }}
            >
              <div className="bg-black/40 backdrop-blur-sm rounded-full">
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
            </div>
          );
        })}

        {/* Center trigger button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className={`relative z-10 p-3 rounded-full transition-all duration-300 ${
            isExpanded
              ? 'bg-amber-500 text-white rotate-45'
              : 'bg-black/40 backdrop-blur-sm text-white hover:bg-black/60'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Settings button - appears when expanded */}
        <div
          className={`absolute transition-all duration-300 ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
          style={{
            transform: `translate(${getArcPosition(buttons.length, buttons.length + 1).x}px, ${getArcPosition(buttons.length, buttons.length + 1).y}px)`,
            transitionDelay: `${buttons.length * 30}ms`,
          }}
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-full">
            <SettingsButton size={size} onClick={onOpenSettings} />
          </div>
        </div>
      </div>
    </div>
  );
}

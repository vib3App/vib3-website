'use client';

import { useState, useRef, useCallback } from 'react';
import { ActionButton } from './ActionButton';
import type { LayoutProps, Position } from '@/types/actionButtons';

export function ArcMenu({
  video,
  buttons,
  size,
  position: _position,
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<Position | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Calculate arc positions - expand UP and LEFT from bottom-right
  const getArcPosition = (index: number, total: number) => {
    // Arc expands upward (-90 is straight up, -180 is left)
    const startAngle = -150; // degrees (up-left)
    const endAngle = -30;    // degrees (up-right)
    const angleStep = (endAngle - startAngle) / (total - 1 || 1);
    const angle = startAngle + angleStep * index;
    const radians = (angle * Math.PI) / 180;
    const radius = 70; // pixels

    return {
      x: Math.cos(radians) * radius,
      y: Math.sin(radians) * radius,
    };
  };

  // Handle long press for drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;

    longPressTimer.current = setTimeout(() => {
      setIsDragging(true);
      onDragStart?.();
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);

    const handleMove = (moveE: PointerEvent) => {
      const dx = Math.abs(moveE.clientX - startX);
      const dy = Math.abs(moveE.clientY - startY);
      if (dx > 10 || dy > 10) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
      if (isDragging) {
        const x = Math.max(10, Math.min(90, (moveE.clientX / window.innerWidth) * 100));
        const y = Math.max(10, Math.min(90, (moveE.clientY / window.innerHeight) * 100));
        setDragPos({ x, y });
      }
    };

    const handleUp = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      if (isDragging && dragPos) {
        onDragEnd?.(dragPos);
      }
      setIsDragging(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [isDragging, dragPos, onDragStart, onDragEnd]);

  // Position style - center-right by default so arc expands into view
  const positionStyle: React.CSSProperties = isDragging && dragPos
    ? {
        position: 'fixed',
        left: `${dragPos.x}%`,
        top: `${dragPos.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
      }
    : {
        position: 'absolute',
        right: '1rem',
        bottom: '50%', // Center vertically so arc has room to expand
        transform: 'translateY(50%)',
      };

  return (
    <div
      ref={containerRef}
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
          onPointerDown={handlePointerDown}
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
      </div>
    </div>
  );
}

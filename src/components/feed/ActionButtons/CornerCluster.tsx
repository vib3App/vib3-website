'use client';

import { useState } from 'react';
import { ActionButton } from './ActionButton';
import { useActionButtonDrag } from '@/hooks/useActionButtonDrag';
import type { LayoutProps } from '@/types/actionButtons';

export function CornerCluster({
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

  // Calculate grid position for expanded state
  const getGridPosition = (index: number) => {
    // 2x3 grid expanding up and left from corner
    const col = index % 2;
    const row = Math.floor(index / 2);
    return {
      x: -col * 50 - 10,
      y: -row * 50 - 60,
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
        right: '0.5rem',
        bottom: '5rem',
      };

  return (
    <div
      {...dragProps}
      className={`z-20 ${isDragging || globalDragging ? 'ring-2 ring-amber-400 rounded-2xl shadow-lg shadow-amber-400/30' : ''}`}
      style={{ ...positionStyle, touchAction: 'none' }}
    >
      <div className="relative">
        {/* Expanded grid of buttons */}
        {buttons.map((btn, index) => {
          const gridPos = getGridPosition(index);
          return (
            <div
              key={btn.id}
              className={`absolute transition-all duration-300 ease-out ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
              style={{
                transform: `translate(${gridPos.x}px, ${gridPos.y}px)`,
                transitionDelay: `${index * 40}ms`,
              }}
            >
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-1">
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

        {/* Collapsed state - show counts */}
        <div
          className={`relative bg-black/40 backdrop-blur-md rounded-2xl p-2 transition-all duration-300 ${isExpanded ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}
        >
          {/* Mini preview with counts */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-2 text-white">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-sm font-medium">{formatCount(video.likesCount)}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">{formatCount(video.commentsCount)}</span>
            </div>
            <span className="text-white/60 text-xs mt-1">Tap to expand</span>
          </button>
        </div>

        {/* Expanded state close button */}
        {isExpanded && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

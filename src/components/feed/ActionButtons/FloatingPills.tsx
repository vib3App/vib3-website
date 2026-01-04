'use client';

import { FloatingPillButton } from '@/components/ui/FloatingPillButton';
import { useActionButtonDrag } from '@/hooks/useActionButtonDrag';
import type { LayoutProps, ButtonId } from '@/types/actionButtons';

export function FloatingPills({
  video,
  buttons,
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

  const getLabel = (id: ButtonId) => {
    if (id === 'share') return 'Share';
    if (id === 'save') return 'Save';
    return undefined;
  };

  const getGradient = (id: ButtonId, index: number) => {
    // Alternate gradients for visual variety
    if (index % 2 === 0) {
      return { from: '#8B5CF6', to: '#14B8A6' };
    }
    return { from: '#14B8A6', to: '#8B5CF6' };
  };

  const getIcon = (id: ButtonId) => {
    switch (id) {
      case 'like':
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'comment':
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'save':
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        );
      case 'share':
        return (
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getActiveIcon = (id: ButtonId) => {
    switch (id) {
      case 'like':
        return (
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        );
      case 'save':
        return (
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
          </svg>
        );
      default:
        return undefined;
    }
  };

  // Filter to only include supported button types
  const supportedButtons = buttons.filter(btn =>
    ['like', 'comment', 'save', 'share'].includes(btn.id)
  );

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
      <div className="flex flex-col gap-3">
        {supportedButtons.map((btn, index) => {
          const gradient = getGradient(btn.id, index);
          const icon = getIcon(btn.id);
          if (!icon) return null;

          return (
            <FloatingPillButton
              key={btn.id}
              icon={icon}
              activeIcon={getActiveIcon(btn.id)}
              count={getCount(btn.id)}
              label={getLabel(btn.id)}
              isActive={getIsActive(btn.id)}
              gradientFrom={gradient.from}
              gradientTo={gradient.to}
              onClick={getOnClick(btn.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

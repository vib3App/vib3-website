'use client';

import { useState, useEffect } from 'react';
import { useActionButtonStore } from '@/stores/actionButtonStore';
import { HorizontalBar } from './HorizontalBar';
import { VerticalStack } from './VerticalStack';
import { FloatingPills } from './FloatingPills';
import { ArcMenu } from './ArcMenu';
import { CornerCluster } from './CornerCluster';
import { SettingsPopover } from './SettingsPopover';
import type { LayoutType, LayoutProps, Position } from '@/types/actionButtons';

interface ActionButtonsProps {
  video: {
    id: string;
    isLiked?: boolean;
    isFavorited?: boolean;
    hasCommented?: boolean;
    hasShared?: boolean;
    likesCount: number;
    commentsCount: number;
    sharesCount?: number;
    savesCount?: number;
    thumbnailUrl?: string;
  };
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onShare: () => void;
}

export function ActionButtons({
  video,
  onLike,
  onComment,
  onSave,
  onShare,
}: ActionButtonsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    preferences,
    mobilePreferences,
    isDragging,
    setDragging,
    setContainerPosition,
    getVisibleButtons,
  } = useActionButtonStore();

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentPrefs = isMobile ? mobilePreferences : preferences;
  const visibleButtons = getVisibleButtons(isMobile);

  const handleDragStart = () => {
    setDragging(true);
  };

  const handleDragEnd = (newPosition: Position) => {
    setContainerPosition(newPosition, isMobile);
    setDragging(false);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const layoutProps = {
    video,
    buttons: visibleButtons,
    size: currentPrefs.size,
    position: currentPrefs.containerPosition,
    isDragging,
    onLike,
    onComment,
    onSave,
    onShare,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onOpenSettings: handleOpenSettings,
  };

  const layout = currentPrefs.layout;

  return (
    <>
      {renderLayout(layout, layoutProps)}

      {/* Fixed settings button - Liquid Glass */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 glass rounded-xl text-white/60 hover:text-white transition-all group"
        title="Customize action buttons"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/0 to-teal-500/0 group-hover:from-purple-500/20 group-hover:to-teal-500/20 transition-all" />
        <svg className="relative w-5 h-5 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <SettingsPopover
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMobile={isMobile}
      />
    </>
  );
}

function renderLayout(layout: LayoutType, props: LayoutProps) {
  switch (layout) {
    case 'horizontal':
      return <HorizontalBar {...props} />;
    case 'vertical':
      return <VerticalStack {...props} />;
    case 'floating':
      return <FloatingPills {...props} />;
    case 'arc':
      return <ArcMenu {...props} />;
    case 'corner':
      return <CornerCluster {...props} />;
    default:
      return <HorizontalBar {...props} />;
  }
}

// Re-export for convenience
export { HorizontalBar, VerticalStack, FloatingPills, ArcMenu, CornerCluster };
export { ActionButton, SettingsButton } from './ActionButton';
export { SettingsPopover };

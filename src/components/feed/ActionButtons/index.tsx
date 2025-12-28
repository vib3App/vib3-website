'use client';

import { useState, useEffect } from 'react';
import { useActionButtonStore } from '@/stores/actionButtonStore';
import { HorizontalBar } from './HorizontalBar';
import { VerticalStack } from './VerticalStack';
import { FloatingPills } from './FloatingPills';
import { ArcMenu } from './ArcMenu';
import { CornerCluster } from './CornerCluster';
import { SettingsPopover } from './SettingsPopover';
import type { LayoutType, Position } from '@/types/actionButtons';

interface ActionButtonsProps {
  video: {
    id: string;
    isLiked?: boolean;
    isFavorited?: boolean;
    likesCount: number;
    commentsCount: number;
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

  const LayoutComponent = getLayoutComponent(currentPrefs.layout);

  return (
    <>
      <LayoutComponent {...layoutProps} />
      <SettingsPopover
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMobile={isMobile}
      />
    </>
  );
}

function getLayoutComponent(layout: LayoutType) {
  switch (layout) {
    case 'horizontal':
      return HorizontalBar;
    case 'vertical':
      return VerticalStack;
    case 'floating':
      return FloatingPills;
    case 'arc':
      return ArcMenu;
    case 'corner':
      return CornerCluster;
    default:
      return HorizontalBar;
  }
}

// Re-export for convenience
export { HorizontalBar, VerticalStack, FloatingPills, ArcMenu, CornerCluster };
export { ActionButton, SettingsButton } from './ActionButton';
export { SettingsPopover };

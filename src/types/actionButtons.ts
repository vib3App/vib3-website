/**
 * Action Button Types
 * Defines types for customizable, draggable action buttons
 */

export type ButtonId = 'like' | 'comment' | 'save' | 'share' | 'remix' | 'sound';
export type LayoutType = 'horizontal' | 'vertical' | 'floating' | 'arc' | 'corner';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonConfig {
  id: ButtonId;
  visible: boolean;
  order: number;
}

export interface Position {
  x: number;  // percentage 0-100
  y: number;  // percentage 0-100
}

export interface ActionButtonPreferences {
  layout: LayoutType;
  size: ButtonSize;
  buttons: ButtonConfig[];
  positions: Record<ButtonId, Position>;  // For floating layout (per-button positions)
  containerPosition: Position;             // For other layouts (single container position)
}

export interface ActionButtonProps {
  id: ButtonId;
  video: {
    id: string;
    isLiked?: boolean;
    isFavorited?: boolean;
    likesCount: number;
    commentsCount: number;
    thumbnailUrl?: string;
  };
  size: ButtonSize;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onShare: () => void;
}

export interface LayoutProps {
  video: {
    id: string;
    isLiked?: boolean;
    isFavorited?: boolean;
    likesCount: number;
    commentsCount: number;
    thumbnailUrl?: string;
  };
  buttons: ButtonConfig[];
  size: ButtonSize;
  position: Position;
  isDragging: boolean;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onShare: () => void;
  onDragStart: () => void;
  onDragEnd: (newPosition: Position) => void;
  onOpenSettings: () => void;
}

export const DEFAULT_BUTTONS: ButtonConfig[] = [
  { id: 'like', visible: true, order: 0 },
  { id: 'comment', visible: true, order: 1 },
  { id: 'save', visible: true, order: 2 },
  { id: 'share', visible: true, order: 3 },
  { id: 'remix', visible: true, order: 4 },
  { id: 'sound', visible: true, order: 5 },
];

export const DEFAULT_PREFERENCES: ActionButtonPreferences = {
  layout: 'vertical', // Match the Flutter app
  size: 'medium',
  buttons: DEFAULT_BUTTONS,
  positions: {
    like: { x: 10, y: 30 },
    comment: { x: 10, y: 40 },
    save: { x: 10, y: 50 },
    share: { x: 10, y: 60 },
    remix: { x: 10, y: 70 },
    sound: { x: 10, y: 80 },
  },
  containerPosition: { x: 50, y: 85 },
};

export const LAYOUT_INFO: Record<LayoutType, { name: string; description: string }> = {
  horizontal: { name: 'Horizontal Bar', description: 'Bottom bar with all actions' },
  vertical: { name: 'Vertical Stack', description: 'Right side stacked buttons' },
  floating: { name: 'Floating Pills', description: 'Drag each button anywhere' },
  arc: { name: 'Arc Menu', description: 'Curved button arrangement' },
  corner: { name: 'Corner Cluster', description: 'Grouped in corner, expands on tap' },
};

export const SIZE_INFO: Record<ButtonSize, { name: string; scale: number }> = {
  small: { name: 'Small', scale: 0.75 },
  medium: { name: 'Medium', scale: 1 },
  large: { name: 'Large', scale: 1.25 },
};
